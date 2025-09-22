// admin-create-user Edge Function
// Creates a Supabase Auth user with a given password and confirms the email immediately.
// Also performs basic authorization: only authenticated admins can call this.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserPayload {
  action?: "create";
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

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

    if (createErr) {
      console.error("createUser error:", createErr);

      // If already exists, try to reset password and fetch user by doing an invite (won't send email) or list
      if (String(createErr.message || "").toLowerCase().includes("already")) {
        // Attempt to find existing user by inviting (will return user if exists)
        const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
          body.email,
          { redirectTo: `${SUPABASE_URL}` },
        );

        if (inviteErr && !String(inviteErr.message || "").toLowerCase().includes("already")) {
          console.error("inviteUserByEmail error:", inviteErr);
        }

        const user = (created?.user ?? inviteData?.user) as any;

        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: createErr.message || "create user failed" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }

        // Update password
        const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
          password: body.password,
        } as any);
        if (updErr) {
          console.error("updateUserById error:", updErr);
          return new Response(
            JSON.stringify({ success: false, error: updErr.message }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }

        return new Response(
          JSON.stringify({ success: true, user: { id: user.id, email: body.email } }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: createErr.message || "create user failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    console.log("User created:", created);

    return new Response(
      JSON.stringify({ success: true, user: { id: created.user?.id, email: created.user?.email } }),
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
