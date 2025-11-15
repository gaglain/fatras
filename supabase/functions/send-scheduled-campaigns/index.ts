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
                <a href="${youtubeUrl}" data-track-url="${youtubeUrl}" style="display: inline-block; position: relative; max-width: 100%;">
                  <img src="${thumbnailUrl}" alt="Vidéo YouTube" style="max-width: 100%; width: 100%; height: auto; border-radius: 8px; display: block;">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 0, 0, 0.9); border-radius: 50%; width: 68px; height: 48px; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="margin-left: 3px;">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </a>
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
        
        // Social media icon colors
        const socialColors: Record<string, string> = {
          facebook: '#1877f2',
          twitter: '#1da1f2',
          instagram: '#e4405f',
          linkedin: '#0077b5'
        };
        
        // SVG icons for social media
        const socialIcons: Record<string, string> = {
          facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>',
          twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
          instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
          linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>'
        };
        
        const linksHtml = platforms
          .filter((p: any) => p.enabled !== false && p.url)
          .map((p: any) => {
            const bgColor = socialColors[p.type] || '#3498db';
            const icon = socialIcons[p.type] || '';
            return `
              <a href="${p.url}" data-track-url="${p.url}" 
                 style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background-color: ${bgColor}; margin: 0 6px; text-decoration: none;">
                ${icon}
              </a>
            `;
          })
          .join('');
        
        if (linksHtml) {
          html += `<div style="text-align: ${alignSoc}; margin: 20px 0; line-height: 0;">${linksHtml}</div>`;
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

serve(handler);