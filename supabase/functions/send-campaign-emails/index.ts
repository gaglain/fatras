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
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

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
    const htmlContent = convertBlocksToHtml(campaign.content || []);

    // Send emails
    const emailPromises = uniqueContacts.map(async (contact) => {
      try {
        const personalizedHtml = htmlContent.replace(/{{first_name}}/g, contact.first_name || 'there');
        
        const result = await resend.emails.send({
          from: "Campaign <onboarding@resend.dev>",
          to: [contact.email],
          subject: campaign.subject || "Newsletter",
          html: personalizedHtml,
        });

        console.log(`Email sent to ${contact.email}:`, result);
        return { success: true, email: contact.email, result };
      } catch (error) {
        console.error(`Failed to send email to ${contact.email}:`, error);
        return { success: false, email: contact.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    console.log(`Campaign sent: ${successCount} successful, ${failCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      totalSent: successCount,
      totalFailed: failCount,
      results
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
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
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

serve(handler);