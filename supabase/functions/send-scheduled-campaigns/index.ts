import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  scheduled_for: string;
  auto_send: boolean;
}

interface ContactList {
  id: string;
  contact_ids: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Checking for scheduled campaigns...');

  try {
    // Get campaigns scheduled for now or past that haven't been sent
    const now = new Date().toISOString();
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .eq('auto_send', true)
      .lte('scheduled_for', now);

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      throw campaignsError;
    }

    console.log(`Found ${campaigns?.length || 0} campaigns to send`);

    for (const campaign of campaigns || []) {
      console.log(`Processing campaign: ${campaign.id}`);
      
      try {
        // Get contact lists for this campaign
        const { data: campaignLists, error: listsError } = await supabase
          .from('campaign_contact_lists')
          .select(`
            contact_list_id,
            contact_lists (
              contact_list_members (
                contact_id,
                contacts (
                  email,
                  first_name,
                  last_name
                )
              )
            )
          `)
          .eq('campaign_id', campaign.id);

        if (listsError) throw listsError;

        // Collect all unique contacts
        const contacts = new Map();
        
        for (const list of campaignLists || []) {
          if (list.contact_lists?.contact_list_members) {
            for (const member of list.contact_lists.contact_list_members) {
              if (member.contacts?.email) {
                contacts.set(member.contacts.email, {
                  email: member.contacts.email,
                  first_name: member.contacts.first_name,
                  last_name: member.contacts.last_name
                });
              }
            }
          }
        }

        const recipients = Array.from(contacts.values());
        console.log(`Sending to ${recipients.length} recipients`);

        if (recipients.length === 0) {
          console.log('No recipients found for campaign:', campaign.id);
          continue;
        }

        // Send emails with tracking
        let sentCount = 0;
        let deliveredCount = 0;
        
        for (const recipient of recipients) {
          try {
            // Build HTML from editor blocks
            const contentBlocks = typeof campaign.content === 'string' ? JSON.parse(campaign.content) : (campaign.content || []);
            const htmlBuilt = convertBlocksToHtml(contentBlocks);
            // Add tracking to the HTML
            const trackedHtml = addEmailTracking(htmlBuilt, campaign.id, (recipient as any).contact_id);
            const personalizedHtml = trackedHtml.replace(/{{first_name}}/g, recipient.first_name || 'there');
            
            const emailResponse = await resend.emails.send({
              from: "Fatras <booking@fatras.net>",
              to: [recipient.email],
              subject: campaign.subject,
              html: personalizedHtml,
            });

            if (emailResponse.data?.id) {
              sentCount++;
              deliveredCount++;
              
              // Log email analytics
              await supabase.from('email_analytics').insert({
                user_id: campaign.user_id,
                campaign_id: campaign.id,
                contact_id: recipient.contact_id,
                event_type: 'sent',
                event_data: { email_id: emailResponse.data.id }
              });
            }
          } catch (emailError) {
            console.error(`Failed to send email to ${recipient.email}:`, emailError);
          }
        }

        // Update campaign status and statistics
        const { error: updateError } = await supabase
          .from('email_campaigns')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_count: sentCount,
            delivered_count: deliveredCount,
            recipient_count: recipients.length
          })
          .eq('id', campaign.id);

        if (updateError) {
          console.error('Error updating campaign:', updateError);
        } else {
          console.log(`Campaign ${campaign.id} sent successfully to ${sentCount}/${recipients.length} recipients`);
        }

      } catch (campaignError) {
        console.error(`Error processing campaign ${campaign.id}:`, campaignError);
        
        // Mark campaign as failed
        await supabase
          .from('email_campaigns')
          .update({ status: 'failed' })
          .eq('id', campaign.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: campaigns?.length || 0,
        message: 'Scheduled campaigns processed' 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-scheduled-campaigns:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

function addEmailTracking(html: string, campaignId: string, contactId: string): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  
  // Add tracking pixel for opens
  const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?campaign=${campaignId}&contact=${contactId}" width="1" height="1" style="display:none;" alt="">`;
  
  // Wrap URLs for click tracking - look for href attributes
  const wrappedHtml = html.replace(
    /href="([^"]+)"/g,
    (match, url) => {
      // Don't track tracking URLs or mailto links
      if (url.includes('track-email-') || url.startsWith('mailto:') || url.startsWith('#')) {
        return match;
      }
      const trackingUrl = `${supabaseUrl}/functions/v1/track-email-click?campaign=${campaignId}&contact=${contactId}&url=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    }
  );
  
  // Add tracking pixel before closing body tag
  return wrappedHtml.replace('</body>', `${trackingPixel}</body>`);
}

function convertBlocksToHtml(blocks: any[]): string {
  let html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  `;

  (blocks || []).forEach((block: any) => {
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
        const linksHtml = platforms
          .filter((p: any) => p.url)
          .map((p: any) => `<a href="${p.url}" data-track-url="${p.url}" style="margin:0 8px;text-decoration:none;color:#3498db">${p.type}</a>`) 
          .join('');
        if (linksHtml) html += `<div style="text-align:${alignSoc}; margin: 16px 0;">${linksHtml}</div>`;
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

serve(handler);