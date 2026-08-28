import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserPayload {
  userId?: string;
  email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

  const authHeader = req.headers.get("Authorization") ?? "";

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = (await req.json()) as DeleteUserPayload;

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerId = authData.user.id;

    const { data: profile, error: profileErr } = await admin
      .from("user_profiles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (profileErr || !profile || !["admin", "super_admin"].includes(profile.role)) {
      return new Response(JSON.stringify({ success: false, error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const inputUserId = body.userId?.trim() || null;
    const inputEmail = body.email?.trim() || null;

    if (!inputUserId && !inputEmail) {
      return new Response(JSON.stringify({ success: false, error: "userId or email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Resolve auth user id
    let targetUserId: string | null = inputUserId;

    if (!targetUserId && inputEmail) {
      const { data: listRes, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 } as any);
      if (listErr) {
        console.error("listUsers error:", listErr);
        throw listErr;
      }
      const found = listRes?.users?.find((u: any) => (u.email || "").toLowerCase() === inputEmail.toLowerCase());
      targetUserId = found?.id ?? null;
    }

    if (!targetUserId && inputEmail) {
      return new Response(JSON.stringify({
        success: true,
        deletedAuth: false,
        message: "Aucun utilisateur Auth trouvé pour cet email",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Delete auth user
    try {
      const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId as string);
      if (delErr) {
        console.error("deleteUser error:", delErr);
        throw delErr;
      }

      console.log("✅ Auth user deleted", { targetUserId, inputEmail });

      return new Response(JSON.stringify({ success: true, deletedAuth: true, userId: targetUserId }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (e: any) {
      // If userId was not an auth id, fallback to email lookup then delete
      if (inputEmail) {
        const { data: listRes, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 } as any);
        if (!listErr && listRes?.users?.length) {
          const found = listRes.users.find((u: any) => (u.email || "").toLowerCase() === inputEmail.toLowerCase());
          const byEmailId = found?.id ?? null;

          if (byEmailId) {
            const { error: delErr2 } = await admin.auth.admin.deleteUser(byEmailId);
            if (!delErr2) {
              console.log("✅ Auth user deleted (resolved by email)", { byEmailId, inputEmail });
              return new Response(JSON.stringify({ success: true, deletedAuth: true, userId: byEmailId }), {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              });
            }
          }
        }
      }

      return new Response(JSON.stringify({
        success: false,
        error: e?.message ?? "delete auth user failed",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (e: any) {
    console.error("Unhandled error in admin-delete-user:", e);
    return new Response(JSON.stringify({ success: false, error: e?.message ?? "unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
