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
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <style>
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 10px !important;
          }
          .responsive-image {
            width: 100% !important;
            height: auto !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px; width: 100%;">
              <tr>
                <td style="padding: 20px;">
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
          const width = block.content?.width || 100;
          const alignImg = block.content?.align || 'center';
          html += `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
              <tr>
                <td align="${alignImg}">
                  <img src="${src}" alt="${alt}" class="responsive-image" style="max-width: ${width}%; width: ${width}%; height: auto; border-radius: 4px; display: block;" width="${Math.round(600 * width / 100)}">
                </td>
              </tr>
            </table>
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
        
        // Inline SVG with real social media logos (more compatible for emails)
        const socialLogos: Record<string, string> = {
          facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22 12a10 10 0 1 0-11.56 9.9v-7h-2.2V12h2.2V9.8c0-2.17 1.29-3.37 3.27-3.37.95 0 1.94.17 1.94.17v2.13h-1.09c-1.07 0-1.41.66-1.41 1.34V12h2.4l-.38 2.9h-2.02v7A10 10 0 0 0 22 12z"/></svg>',
          instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>',
          linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M4.98 3.5C4.98 4.61 4.1 5.5 3 5.5S1.02 4.61 1.02 3.5C1.02 2.39 1.9 1.5 3 1.5s1.98.89 1.98 2zM1 8h4v13H1zM9 8h3.8v1.8h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21H17v-5.3c0-1.27-.02-2.91-1.77-2.91-1.77 0-2.04 1.38-2.04 2.82V21H9z"/></svg>',
          youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2C0 9.1 0 12 0 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>'
        };
        
        const cellsHtml = platforms
          .filter((p: any) => p.enabled !== false && p.url && p.type !== 'twitter')
          .map((p: any) => {
            const colorValue = p.color || '#3498db';
            const logoSvg = socialLogos[p.type] || '';
            return `
              <td style="padding: 0 6px;">
                <a href="${p.url}" data-track-url="${p.url}" style="display: inline-block; color: ${colorValue}; text-decoration: none; line-height: 0;">
                  ${logoSvg}
                </a>
              </td>`;
          })
          .join('');
        
        if (cellsHtml) {
          html += `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
              <tr>
                <td align="${alignSoc}">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-block;">
                    <tr>
                      ${cellsHtml}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          `;
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
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return html;
}

serve(handler);