import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, title, message, data } = await req.json();

    if (!user_email) {
      return new Response(
        JSON.stringify({ error: "Missing user_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const channelName = data?.channel_name || "";
    const noteTitle = data?.note_title || title || "une discussion";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf8f4; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
          .header { background: #b45309; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
          .body { background: white; padding: 24px; border: 1px solid #d6d3d1; border-top: none; border-radius: 0 0 8px 8px; }
          .message-box { background: #f5f1ed; border-radius: 6px; padding: 16px; margin: 16px 0; border-left: 3px solid #b45309; }
          .message-box p { margin: 0; color: #1e1e1e; font-size: 14px; line-height: 1.5; }
          .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #78716c; }
          .btn { display: inline-block; background: #b45309; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 500; font-size: 14px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vous avez ete mentionne</h1>
          </div>
          <div class="body">
            <p style="color: #78716c; font-size: 14px; margin-top: 0;">
              ${channelName ? `Dans le canal <strong>${channelName}</strong>` : `Dans <strong>${noteTitle}</strong>`}
            </p>
            <div class="message-box">
              <p>${message || ""}</p>
            </div>
            <p class="footer">
              Cet email a ete envoye car vous avez active les notifications par email pour les mentions.<br>
              Vous pouvez desactiver cette option dans vos preferences.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Fatras <noreply@fatras.net>",
        to: [user_email],
        subject: `Mention : ${title || "Quelqu'un vous a mentionne"}`,
        html: htmlContent,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Mention email sent to:", user_email);
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
