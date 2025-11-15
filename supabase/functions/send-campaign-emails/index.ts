import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
}

interface EmailBlock {
  id: string;
  type: string;
  content: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId }: SendCampaignRequest = await req.json();

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError);
      throw new Error('Campaign not found: ' + campaignError?.message);
    }

    console.log('Campaign found:', campaign.name);

    // Get campaign contact lists
    const { data: campaignLists, error: listsError } = await supabase
      .from('campaign_contact_lists')
      .select(`
        contact_list_id,
        contact_lists!inner(
          id,
          name
        )
      `)
      .eq('campaign_id', campaignId);

    if (listsError) {
      throw new Error('Failed to fetch contact lists');
    }

    // Get all contacts from the selected lists
    const listIds = campaignLists.map(cl => cl.contact_list_id);
    const { data: contactMembers, error: contactsError } = await supabase
      .from('contact_list_members')
      .select(`
        contact_id,
        contacts!inner(
          id,
          email,
          first_name,
          last_name,
          accepts_marketing_emails
        )
      `)
      .in('contact_list_id', listIds);

    if (contactsError) {
      throw new Error('Failed to fetch contacts');
    }

    // Filter contacts that accept marketing emails and have valid emails
    const validContacts = contactMembers
      .filter(cm => 
        cm.contacts.accepts_marketing_emails && 
        cm.contacts.email &&
        cm.contacts.email.includes('@')
      )
      .map(cm => cm.contacts);

    // Remove duplicates
    const uniqueContacts = validContacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.email === contact.email)
    );

    console.log(`Sending campaign to ${uniqueContacts.length} contacts`);

    // Convert blocks to HTML
    const contentBlocks = typeof campaign.content === 'string' 
      ? JSON.parse(campaign.content) 
      : campaign.content || [];
    const htmlContent = convertBlocksToHtml(contentBlocks);

    // Split contacts into batches of 100 (Resend batch API limit)
    const BATCH_SIZE = 100;
    const batches: typeof uniqueContacts[] = [];
    for (let i = 0; i < uniqueContacts.length; i += BATCH_SIZE) {
      batches.push(uniqueContacts.slice(i, i + BATCH_SIZE));
    }

    console.log(`Split into ${batches.length} batches of max ${BATCH_SIZE} contacts`);

    let allResults: any[] = [];

    // Send emails batch by batch using Resend batch API
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Sending batch ${batchIndex + 1}/${batches.length} with ${batch.length} contacts`);

      try {
        // Prepare batch emails
        const batchEmails = batch.map((contact) => {
          const trackedHtml = addEmailTracking(htmlContent, campaign.id, contact.id);
          const personalizedHtml = trackedHtml.replace(/{{first_name}}/g, contact.first_name || 'there');
          
          return {
            from: "Campaign <booking@fatras.net>",
            to: [contact.email],
            subject: campaign.subject || "Newsletter",
            html: personalizedHtml,
            tags: [
              { name: 'campaign_id', value: campaign.id },
              { name: 'contact_id', value: contact.id }
            ]
          };
        });

        console.log(`Prepared ${batchEmails.length} emails for batch send`);

        // Send batch using Resend batch API
        const batchResult = await resend.batch.send(batchEmails);

        console.log('Batch result:', JSON.stringify(batchResult, null, 2));

        // Process batch results
        if (batchResult.data) {
          const batchResultsProcessed = await Promise.all(
            batch.map(async (contact, index) => {
              const emailResult = batchResult.data?.[index];
              
              if (emailResult && !emailResult.error) {
                // Log email analytics
                try {
                  await supabase.from('email_analytics').insert({
                    user_id: campaign.user_id,
                    campaign_id: campaign.id,
                    contact_id: contact.id,
                    event_type: 'sent',
                    event_data: { email_id: emailResult.id }
                  });
                } catch (analyticsError) {
                  console.error(`Failed to log analytics for ${contact.email}:`, analyticsError);
                }

                console.log(`✓ Email sent to ${contact.email}`);
                return { success: true, email: contact.email, result: emailResult };
              } else {
                console.error(`✗ Failed to send email to ${contact.email}:`, emailResult?.error || emailResult);
                return { success: false, email: contact.email, error: emailResult?.error || 'Unknown error' };
              }
            })
          );
          allResults = [...allResults, ...batchResultsProcessed];
        } else if (batchResult.error) {
          console.error('Batch send error:', batchResult.error);
          const failedResults = batch.map(contact => ({
            success: false,
            email: contact.email,
            error: batchResult.error.message
          }));
          allResults = [...allResults, ...failedResults];
        }

        // Add small delay between batches to avoid rate limiting
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError) {
        console.error(`Error sending batch ${batchIndex + 1}:`, batchError);
        // Mark all contacts in this batch as failed
        const failedResults = batch.map(contact => ({
          success: false,
          email: contact.email,
          error: batchError.message
        }));
        allResults = [...allResults, ...failedResults];
      }
    }

    const successCount = allResults.filter(r => r.success).length;
    const failCount = allResults.filter(r => !r.success).length;

    // Update campaign status and stats
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: successCount,
        delivered_count: successCount,
        recipient_count: uniqueContacts.length
      })
      .eq('id', campaignId);

    console.log(`Campaign sent: ${successCount} successful, ${failCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      totalSent: successCount,
      totalFailed: failCount,
      totalContacts: uniqueContacts.length,
      batchesProcessed: batches.length,
      results: allResults
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-campaign-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function convertBlocksToHtml(blocks: EmailBlock[]): string {
  let html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  `;

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading':
        const level = block.content.level || 1;
        html += `<h${level} style="color: #2c3e50; margin-bottom: 16px;">${block.content.text || ''}</h${level}>`;
        break;
      case 'text':
        html += `<p style="margin-bottom: 16px; font-size: 16px;">${block.content.text || ''}</p>`;
        break;
      case 'button':
        html += `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${block.content.url || '#'}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;"
               data-track-url="${block.content.url || '#'}">
              ${block.content.text || 'Click here'}
            </a>
          </div>
        `;
        break;
      case 'image':
        if (block.content.url) {
          html += `
            <div style="text-align: center; margin: 20px 0;">
              <img src="${block.content.url}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; border-radius: 4px;">
            </div>
          `;
        }
        break;
      case 'divider':
        html += `<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">`;
        break;
      case 'spacer':
        const height = block.content.height || 20;
        html += `<div style="height: ${height}px;"></div>`;
        break;
    }
  });

  html += `
      </body>
    </html>
  `;

  return html;
}

function addEmailTracking(html: string, campaignId: string, contactId: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  
  // Add tracking pixel for opens
  const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?campaign=${campaignId}&contact=${contactId}" width="1" height="1" style="display:none;" alt="">`;
  
  // Wrap URLs for click tracking
  const wrappedHtml = html.replace(
    /data-track-url="([^"]+)"/g,
    (match, url) => {
      const trackingUrl = `${supabaseUrl}/functions/v1/track-email-click?campaign=${campaignId}&contact=${contactId}&url=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    }
  );
  
  // Add tracking pixel before closing body tag
  return wrappedHtml.replace('</body>', `${trackingPixel}</body>`);
}

serve(handler);