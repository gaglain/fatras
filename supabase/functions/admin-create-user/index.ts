// admin-create-user Edge Function
// Creates a Supabase Auth user with a given password and confirms the email immediately.
// Also sends a welcome email with credentials via Resend.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserPayload {
  action?: "create";
  email: string;
  password: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  const authHeader = req.headers.get("Authorization") ?? "";

  // Client bound to the caller's JWT (to read current user)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  // Admin client for privileged operations
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = (await req.json()) as CreateUserPayload;

    if (!body?.email || !body?.password) {
      return new Response(
        JSON.stringify({ success: false, error: "email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Get caller user
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      console.error("Unauthorized call or no user:", authErr);
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerId = authData.user.id;

    // Verify admin role of caller
    const { data: profile, error: profileErr } = await admin
      .from("user_profiles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (profileErr || !profile || !["admin", "super_admin"].includes(profile.role)) {
      console.warn("Forbidden: caller is not admin", { callerId, profileErr, profile });
      return new Response(JSON.stringify({ success: false, error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Try to create user
    console.log("Creating auth user via admin API", { email: body.email });
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: body.metadata ?? {},
    } as any);

    let userId: string | null = null;
    let isNewUser = true;

    if (createErr) {
      console.error("createUser error:", createErr);

      // If already exists, try to update password for the existing user
      if (
        String(createErr.message || "").toLowerCase().includes("already") ||
        String((createErr as any).code || "").toLowerCase().includes("email_exists")
      ) {
        isNewUser = false;
        
        // Try to find the auth user id via our public.user_profiles table first
        const { data: profileByEmail, error: profileByEmailErr } = await admin
          .from("user_profiles")
          .select("user_id")
          .eq("email", body.email)
          .not("user_id", "is", null)
          .single();

        if (!profileByEmailErr && profileByEmail?.user_id) {
          userId = profileByEmail.user_id as string;
        } else {
          // Fallback: list users and match by email
          try {
            const { data: listRes, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 } as any);
            if (!listErr && listRes?.users?.length) {
              const found = listRes.users.find((u: any) => (u.email || "").toLowerCase() === body.email.toLowerCase());
              userId = found?.id ?? null;
            }
          } catch (lerr) {
            console.error("listUsers fallback error:", lerr);
          }
        }

        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: "L'utilisateur existe déjà mais n'a pas pu être récupéré" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }

        // Update password and ensure email is confirmed
        const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
          password: body.password,
          email_confirm: true,
          user_metadata: body.metadata ?? {},
        } as any);
        
        if (updErr) {
          console.error("updateUserById error:", updErr);
          return new Response(
            JSON.stringify({ success: false, error: updErr.message }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }
        
        console.log("User password updated:", userId);
      } else {
        return new Response(
          JSON.stringify({ success: false, error: createErr.message || "create user failed" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
    } else {
      userId = created.user?.id ?? null;
      console.log("User created:", created);
    }

    // Send welcome email if RESEND_API_KEY is configured
    let emailSent = false;
    let emailError: string | null = null;

    if (RESEND_API_KEY && body.sendEmail !== false) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        const firstName = body.metadata?.first_name || '';
        const lastName = body.metadata?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || body.email;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Bienvenue sur Fatras Booking</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Fatras Booking</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333;">Bienvenue ${fullName} !</h2>
              <p>Votre compte a été créé sur Fatras Booking.</p>
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0;"><strong>Email :</strong> ${body.email}</p>
                <p style="margin: 10px 0 0;"><strong>Mot de passe :</strong> <code style="background: #f0f0f0; padding: 2px 8px; border-radius: 3px;">${body.password}</code></p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://fatras.netlify.app/auth" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Se connecter
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                Fatras Booking - Gestion de booking artistique
              </p>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Fatras Booking <booking@fatras.net>",
          to: [body.email],
          subject: "Bienvenue sur Fatras Booking - Vos identifiants",
          html: emailHtml,
        });

        console.log("✅ Welcome email sent:", emailResponse);
        emailSent = true;
      } catch (err: any) {
        console.error("❌ Error sending welcome email:", err);
        emailError = err?.message || "Email sending failed";
      }
    } else if (!RESEND_API_KEY) {
      emailError = "RESEND_API_KEY not configured";
      console.warn("RESEND_API_KEY not configured, skipping email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { id: userId, email: body.email },
        emailSent,
        emailError,
        isNewUser
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e) {
    console.error("Unhandled error in admin-create-user:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message ?? "unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
