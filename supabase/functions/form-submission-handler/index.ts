import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormSubmissionPayload {
  formId: string;
  data: Record<string, any>;
  honeypot?: string;
}

// Extract contact information from form data
function extractContactInfo(data: Record<string, any>): {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
} {
  const result: any = {};
  
  // Look for common field names (case insensitive)
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (!result.email && (lowerKey.includes('email') || lowerKey.includes('mail'))) {
      result.email = String(value).trim();
    }
    if (!result.firstName && (lowerKey.includes('prenom') || lowerKey.includes('prénom') || lowerKey.includes('first') || lowerKey === 'nom')) {
      result.firstName = String(value).trim();
    }
    if (!result.lastName && (lowerKey.includes('nom_famille') || lowerKey.includes('last') || lowerKey.includes('surname'))) {
      result.lastName = String(value).trim();
    }
    if (!result.phone && (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('téléphone') || lowerKey.includes('mobile'))) {
      result.phone = String(value).trim();
    }
    if (!result.company && (lowerKey.includes('entreprise') || lowerKey.includes('company') || lowerKey.includes('société') || lowerKey.includes('organisation'))) {
      result.company = String(value).trim();
    }
  }
  
  // If we have a combined "name" field, split it
  if (!result.firstName) {
    const nameField = Object.entries(data).find(([key]) => 
      key.toLowerCase() === 'name' || key.toLowerCase() === 'nom'
    );
    if (nameField) {
      const parts = String(nameField[1]).trim().split(' ');
      result.firstName = parts[0] || '';
      result.lastName = parts.slice(1).join(' ') || '';
    }
  }
  
  return result;
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

    const { formId, data, honeypot }: FormSubmissionPayload = await req.json();

    // Honeypot anti-spam check — only reject when the rest of the payload is empty.
    // Browser / password-manager autofill fills the hidden trap on legitimate submissions,
    // which used to silently drop real answers (including forms without a required email).
    if (honeypot && honeypot.trim() !== '') {
      const filledCount = Object.values(data || {}).filter((v) => {
        if (v === null || v === undefined) return false;
        if (Array.isArray(v)) return v.length > 0;
        return String(v).trim() !== '';
      }).length;
      if (filledCount < 2) {
        console.log("🤖 Bot detected via honeypot (payload quasi vide), rejecting submission");
        // Return fake success to not alert the bot
        return new Response(
          JSON.stringify({ success: true, submissionId: "fake_id", emailSent: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.warn("⚠️ Honeypot rempli mais soumission valide (autofill probable) — traitement maintenu");
    }


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
      .select("id, user_id, name, settings, description, fields")
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

    // Build a map of field ID -> label from form fields definition
    const rawFields = typeof formRow.fields === "string"
      ? JSON.parse(formRow.fields)
      : formRow.fields || [];
    const fieldLabels: Record<string, string> = {};
    if (Array.isArray(rawFields)) {
      for (const f of rawFields) {
        if (f.id && f.label) {
          fieldLabels[f.id] = f.label;
        }
      }
    }

    // Helper to get human-readable key
    const getFieldLabel = (key: string) => fieldLabels[key] || key;

    const sendNotification = settings.sendNotification !== false;
    const notificationEmail: string | undefined = settings.notificationEmail;
    const addToContacts = settings.addToContacts !== false; // default true

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

    console.log("✅ Submission saved:", submissionInsert.id);

    // Auto-create contact if enabled and email is present
    let contactCreated = false;
    if (addToContacts) {
      const contactInfo = extractContactInfo(data);
      
      if (contactInfo.email) {
        // Check if contact already exists by email for this user
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("id, email")
          .eq("user_id", formRow.user_id)
          .ilike("email", contactInfo.email)
          .maybeSingle();

        if (!existingContact) {
          // Create new contact
          const { error: contactError } = await supabase
            .from("contacts")
            .insert({
              user_id: formRow.user_id,
              email: contactInfo.email,
              first_name: contactInfo.firstName || 'Contact',
              last_name: contactInfo.lastName || 'Formulaire',
              phone: contactInfo.phone || null,
              company: contactInfo.company || null,
              source: `Formulaire: ${formRow.name}`,
              status: 'prospect',
              tags: ['formulaire', formRow.name.toLowerCase().replace(/\s+/g, '-')],
            });

          if (contactError) {
            console.error("Error creating contact:", contactError);
          } else {
            contactCreated = true;
            console.log("✅ Contact created:", contactInfo.email);
          }
        } else {
          console.log("ℹ️ Contact already exists:", existingContact.email);
        }
      }
    }

    // Create a task for the form owner
    const taskTitle = `Nouvelle soumission: ${formRow.name}`;
    const taskDescription =
      "Détails de la soumission:\n" +
      Object.entries(data)
        .map(([k, v]) => `${getFieldLabel(k)}: ${String(v)}`)
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
    }

    // Send notification email if configured
    let emailSent = false;
    if (sendNotification) {
      let toEmail = notificationEmail?.trim() || "booking@fatras.net";

      if (toEmail && resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7C3AED;">Nouvelle soumission: ${formRow.name}</h2>
              <p>Une nouvelle entrée vient d'être enregistrée.</p>
              ${contactCreated ? '<p style="color: #10B981;">✅ Un nouveau contact a été ajouté automatiquement.</p>' : ''}
              <h3>Détails:</h3>
              <table style="border-collapse: collapse; width: 100%;">
                ${Object.entries(data)
                  .map(
                    ([k, v]) => `
                  <tr>
                    <td style="border: 1px solid #E5E7EB; padding: 8px; font-weight: 600; background: #F9FAFB;">${getFieldLabel(k)}</td>
                    <td style="border: 1px solid #E5E7EB; padding: 8px;">${String(v)}</td>
                  </tr>`
                  )
                  .join("")}
              </table>
              <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">
                Soumis le: ${new Date(submissionInsert.submitted_at).toLocaleString('fr-FR')}
              </p>
            </div>
          `;

          await resend.emails.send({
            from: "Formulaires <noreply@fatras.net>",
            to: [toEmail],
            subject: `[Formulaire] ${formRow.name} - nouvelle entrée`,
            html,
          });
          emailSent = true;
          console.log("✅ Email notification sent to:", toEmail);
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
        contactCreated,
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