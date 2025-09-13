import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormSubmissionPayload {
  formId: string;
  data: Record<string, any>;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { formId, data }: FormSubmissionPayload = await req.json();

    if (!formId || !data) {
      return new Response(JSON.stringify({ error: "Missing formId or data" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch form meta (owner, settings, name)
    const { data: formRow, error: formError } = await supabase
      .from("forms")
      .select("id, user_id, name, settings, description")
      .eq("id", formId)
      .single();

    if (formError || !formRow) {
      console.error("Form not found:", formError);
      return new Response(JSON.stringify({ error: "Form not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const settings =
      typeof formRow.settings === "string"
        ? JSON.parse(formRow.settings)
        : formRow.settings || {};

    const sendNotification = settings.sendNotification !== false; // default true
    const notificationEmail: string | undefined = settings.notificationEmail;

    // Insert submission
    const userAgent = req.headers.get("user-agent") || null;
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null;

    const { data: submissionInsert, error: submissionError } = await supabase
      .from("form_submissions")
      .insert({
        form_id: formId,
        data,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select("id, submitted_at")
      .single();

    if (submissionError) {
      console.error("Error inserting submission:", submissionError);
      return new Response(JSON.stringify({ error: "Failed to store submission" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create a task for the form owner
    const taskTitle = `Nouvelle soumission: ${formRow.name}`;
    const taskDescription =
      "Détails de la soumission:\n" +
      Object.entries(data)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join("\n");

    const { error: taskError } = await supabase.from("tasks").insert({
      user_id: formRow.user_id,
      title: taskTitle,
      description: taskDescription,
      status: "todo",
      priority: "medium",
    });

    if (taskError) {
      console.error("Error creating task:", taskError);
      // Continue even if task creation fails
    }

    // Send notification email if configured
    let emailSent = false;
    if (sendNotification) {
      let toEmail = notificationEmail?.trim();

      if (!toEmail) {
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("email, first_name")
          .eq("id", formRow.user_id)
          .single();
        toEmail = ownerProfile?.email || undefined;
      }

      if (toEmail && resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const html = `
            <div>
              <h2>Nouvelle soumission au formulaire: ${formRow.name}</h2>
              <p>Une nouvelle entrée vient d'être enregistrée.</p>
              <h3>Détails:</h3>
              <table style="border-collapse:collapse;">
                ${Object.entries(data)
                  .map(
                    ([k, v]) => `
                  <tr>
                    <td style="border:1px solid #eee;padding:8px;font-weight:600;">${k}</td>
                    <td style="border:1px solid #eee;padding:8px;">${String(v)}</td>
                  </tr>`
                  )
                  .join("")}
              </table>
              <p style="color:#888;">Soumis le: ${submissionInsert.submitted_at}</p>
            </div>
          `;

          await resend.emails.send({
            from: "Formulaires <noreply@fatras-booking.com>",
            to: [toEmail],
            subject: `[Formulaire] ${formRow.name} - nouvelle entrée`,
            html,
          });
          emailSent = true;
        } catch (e) {
          console.error("Error sending email:", e);
        }
      } else if (!resendApiKey) {
        console.warn("RESEND_API_KEY non configurée. Email non envoyé.");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        submissionId: submissionInsert.id,
        emailSent,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Unhandled error in form-submission-handler:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});