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

    // Use service role client (campaign ownership is enforced via campaign.user_id).
    // This allows both authenticated UI calls and the scheduled cron caller to work uniformly.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    console.log(`Campaign has ${uniqueContacts.length} unique contacts`);

    // ===== Paramètres utilisateur (limite journalière + heure d'envoi) =====
    // Réglages dans Préférences → Email. Par défaut 200 / 8h UTC.
    let DAILY_LIMIT = 200;
    let SEND_HOUR_UTC = 8;
    try {
      const { data: settingsRows } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', campaign.user_id)
        .in('setting_key', ['email_campaign_daily_limit', 'email_campaign_send_hour_utc']);
      for (const r of (settingsRows || []) as any[]) {
        if (r.setting_key === 'email_campaign_daily_limit') {
          const n = parseInt(r.setting_value, 10);
          if (!isNaN(n) && n > 0 && n <= 5000) DAILY_LIMIT = n;
        }
        if (r.setting_key === 'email_campaign_send_hour_utc') {
          const n = parseInt(r.setting_value, 10);
          if (!isNaN(n) && n >= 0 && n <= 23) SEND_HOUR_UTC = n;
        }
      }
    } catch (_) { /* defaults */ }

    // Contacts déjà envoyés POUR CETTE CAMPAGNE (lors d'exécutions précédentes)
    const { data: alreadySentRows } = await supabase
      .from('email_analytics')
      .select('contact_id')
      .eq('campaign_id', campaign.id)
      .eq('event_type', 'sent');
    const alreadySentIds = new Set((alreadySentRows || []).map((r: any) => r.contact_id));

    // Total envoyé AUJOURD'HUI par cet utilisateur (toutes campagnes confondues)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count: sentTodayCount } = await supabase
      .from('email_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', campaign.user_id)
      .eq('event_type', 'sent')
      .gte('created_at', todayStart.toISOString());

    const remainingQuota = Math.max(0, DAILY_LIMIT - (sentTodayCount || 0));
    const pendingContacts = uniqueContacts.filter((c: any) => !alreadySentIds.has(c.id));
    const contactsToSend = pendingContacts.slice(0, remainingQuota);
    const leftoverAfter = pendingContacts.length - contactsToSend.length;

    console.log(`Daily quota: ${remainingQuota}/${DAILY_LIMIT} restants. À envoyer maintenant: ${contactsToSend.length}. Reste après: ${leftoverAfter}.`);

    if (contactsToSend.length === 0 && leftoverAfter > 0) {
      // Quota déjà épuisé pour aujourd'hui → reprogrammer demain à l'heure configurée
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);
      await supabase
        .from('email_campaigns')
        .update({ status: 'sending', scheduled_for: tomorrow.toISOString(), auto_send: true, recipient_count: uniqueContacts.length })
        .eq('id', campaignId);
      return new Response(JSON.stringify({
        success: true, totalSent: 0, totalFailed: 0, totalContacts: uniqueContacts.length,
        deferred: leftoverAfter, nextRunAt: tomorrow.toISOString(),
        message: `Quota journalier Resend atteint. ${leftoverAfter} contacts seront envoyés à partir de ${tomorrow.toISOString()}.`
      }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Convert blocks to HTML
    const contentBlocks = typeof campaign.content === 'string' 
      ? JSON.parse(campaign.content) 
      : campaign.content || [];
    
    console.log('Content blocks:', JSON.stringify(contentBlocks, null, 2));
    let htmlContent = convertBlocksToHtml(contentBlocks);

    // Optionally append the user's email signature
    if (campaign.include_signature && campaign.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email_signature')
        .eq('user_id', campaign.user_id)
        .maybeSingle();
      const signatureHtml = profile?.email_signature?.trim();
      if (signatureHtml) {
        // Append signature at the END of the email content (below the body)
        const injection = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:14px;color:#333;">${signatureHtml}</div>`;
        // Insert before the LAST closing </td> of the inner content cell (right before </tr></table></td></tr></table></body>)
        const innerCloseRegex = /(\s*<\/td>\s*<\/tr>\s*<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>\s*<\/body>)/i;
        if (innerCloseRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(innerCloseRegex, `${injection}$1`);
        } else if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', `${injection}</body>`);
        } else {
          htmlContent = htmlContent + injection;
        }
      }
    }

    console.log('Generated HTML length:', htmlContent.length);

    // Split contacts into batches of 100 (Resend batch API limit)
    const BATCH_SIZE = 100;
    const batches: typeof contactsToSend[] = [];
    for (let i = 0; i < contactsToSend.length; i += BATCH_SIZE) {
      batches.push(contactsToSend.slice(i, i + BATCH_SIZE));
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
    const cumulativeSent = alreadySentIds.size + successCount;
    const stillPending = pendingContacts.length - successCount;

    // GARDE-FOU : ne marquer "sent" que si TOUS les destinataires ont reçu l'email.
    // Tant que cumulativeSent < uniqueContacts.length, la campagne reste "sending"
    // et est reprogrammée pour le lendemain à l'heure configurée par l'utilisateur.
    const isFullyDelivered = cumulativeSent >= uniqueContacts.length && stillPending <= 0;

    if (!isFullyDelivered) {
      // Reprogrammer demain à l'heure configurée pour finir les envois restants
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
          scheduled_for: tomorrow.toISOString(),
          auto_send: true,
          sent_count: cumulativeSent,
          delivered_count: cumulativeSent,
          recipient_count: uniqueContacts.length,
        })
        .eq('id', campaignId);
      console.log(`Campaign partial: ${cumulativeSent}/${uniqueContacts.length} envoyés. ${Math.max(stillPending, uniqueContacts.length - cumulativeSent)} reprogrammés pour ${tomorrow.toISOString()}.`);
    } else {
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: cumulativeSent,
          delivered_count: cumulativeSent,
          recipient_count: uniqueContacts.length,
        })
        .eq('id', campaignId);
      console.log(`Campaign fully sent: ${cumulativeSent}/${uniqueContacts.length} (${successCount} dans cette exécution, ${failCount} échecs).`);
    }

    return new Response(JSON.stringify({
      success: true,
      totalSent: successCount,
      totalFailed: failCount,
      totalContacts: uniqueContacts.length,
      cumulativeSent,
      deferred: stillPending,
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
        
        // Use PNG icons for maximum email client compatibility (Gmail blocks inline SVG)
        const socialIconUrls: Record<string, string> = {
          facebook: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/facebook.png',
          instagram: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/instagram.png',
          linkedin: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/linkedin.png',
          youtube: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/youtube.png'
        };
        
        const cellsHtml = platforms
          .filter((p: any) => p.enabled !== false && p.url && p.type !== 'twitter')
          .map((p: any) => {
            const bgColor = p.color || '#3498db';
            const iconUrl = socialIconUrls[p.type] || '';
            if (!iconUrl) return '';
            return `
              	<td style="padding: 0 6px;">
                	<a href="${p.url}" data-track-url="${p.url}" style="display: inline-block; text-decoration: none; line-height: 0;">
                  	<span style="display:inline-block; background-color:${bgColor}; border-radius:9999px; padding:8px;">
                    	<img src="${iconUrl}" alt="${p.type}" width="20" height="20" style="display:block; border:0; outline:none;">
                  	</span>
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