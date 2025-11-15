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
    
    console.log('Content blocks:', JSON.stringify(contentBlocks, null, 2));
    const htmlContent = convertBlocksToHtml(contentBlocks);
    console.log('Generated HTML length:', htmlContent.length);

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
            from: "Fatras <booking@fatras.net>",
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
              const emailResult = batchResult.data?.data?.[index];
              
              if (emailResult && emailResult.id && !emailResult.error) {
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
      case 'heading': {
        const rawLevel = (block.content?.level ?? 'h1').toString();
        const levelNum = parseInt(rawLevel.replace('h', '')) || 1;
        const align = block.content?.align || 'left';
        const color = block.content?.color || '#2c3e50';
        const text = block.content?.text || '';
        html += `<h${levelNum} style="color: ${color}; margin-bottom: 16px; text-align: ${align};">${text}</h${levelNum}>`;
        break;
      }
      case 'text': {
        const htmlText = block.content?.html ?? block.content?.text ?? '';
        html += `<div style="margin-bottom: 16px; font-size: 16px;">${htmlText}</div>`;
        break;
      }
      case 'button': {
        const url = block.content?.url || '#';
        const btnBg = block.content?.backgroundColor || '#3498db';
        const btnColor = block.content?.textColor || '#ffffff';
        const alignBtn = block.content?.align || 'center';
        const radius = Number(block.content?.borderRadius ?? 4);
        const btnText = block.content?.text || 'Click here';
        html += `
          <div style="text-align: ${alignBtn}; margin: 24px 0;">
            <a href="${url}" 
               style="background-color: ${btnBg}; color: ${btnColor}; padding: 12px 24px; text-decoration: none; border-radius: ${radius}px; display: inline-block; font-weight: bold;"
               data-track-url="${url}">
              ${btnText}
            </a>
          </div>
        `;
        break;
      }
      case 'image': {
        const src = block.content?.src || block.content?.url;
        if (src) {
          const alt = block.content?.alt || '';
          const width = block.content?.width || '100%';
          const alignImg = block.content?.align || 'center';
          html += `
            <div style="text-align: ${alignImg}; margin: 20px 0;">
              <img src="${src}" alt="${alt}" style="max-width: ${width}; width: ${width}; height: auto; border-radius: 4px;">
            </div>
          `;
        }
        break;
      }
      case 'video': {
        const videoUrl = block.content?.url;
        if (videoUrl) {
          // Extract YouTube video ID
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = videoUrl.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : '';
          
          if (videoId) {
            const alignVideo = block.content?.align || 'center';
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            html += `
              <div style="text-align: ${alignVideo}; margin: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${alignVideo === 'left' ? 'left' : alignVideo === 'right' ? 'right' : 'center'}" style="margin: 0 ${alignVideo === 'center' ? 'auto' : '0'};">
                  <tr>
                    <td style="position: relative; display: inline-block;">
                      <a href="${youtubeUrl}" data-track-url="${youtubeUrl}" style="display: block; position: relative; text-decoration: none;">
                        <img src="${thumbnailUrl}" alt="Vidéo YouTube" style="display: block; max-width: 100%; width: 560px; height: auto; border-radius: 8px; border: none;">
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            `;
          }
        }
        break;
      }
      case 'divider': {
        const divColor = block.content?.color || '#eee';
        const divHeight = block.content?.height || 1;
        html += `<hr style="border: none; border-top: ${divHeight}px solid ${divColor}; margin: 24px 0;">`;
        break;
      }
      case 'spacer': {
        const height = block.content?.height || 20;
        html += `<div style="height: ${height}px;"></div>`;
        break;
      }
      case 'social': {
        const alignSoc = block.content?.align || 'center';
        const platforms = block.content?.platforms || [];
        
        // SVG icons for social media
        const socialIcons: Record<string, string> = {
          facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>',
          instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
          linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>',
          youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
        };
        
        const linksHtml = platforms
          .filter((p: any) => p.enabled !== false && p.url)
          .map((p: any) => {
            const bgColor = p.color || '#3498db';
            const icon = socialIcons[p.type] || '';
            return `
              <a href="${p.url}" data-track-url="${p.url}" 
                 style="display: inline-block; width: 40px; height: 40px; border-radius: 50%; background-color: ${bgColor}; margin: 0 6px; text-decoration: none; line-height: 40px; text-align: center;">
                ${icon}
              </a>
            `;
          })
          .join('');
        
        if (linksHtml) {
          html += `<div style="text-align: ${alignSoc}; margin: 20px 0;">${linksHtml}</div>`;
        }
        break;
      }
      case 'columns': {
        const cols = (block.content?.columns || [])
          .map((c: any) => `<td style=\"vertical-align: top; width:50%; padding: 0 8px;\">${c.html || ''}</td>`) 
          .join('');
        if (cols) html += `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 16px 0;"><tr>${cols}</tr></table>`;
        break;
      }
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