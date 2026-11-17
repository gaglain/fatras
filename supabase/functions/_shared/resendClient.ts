// Resend calls go through the Lovable connector gateway (RESEND_API_KEY is a gateway connection key).
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export async function resendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${lovableKey}`);
  headers.set("X-Connection-Api-Key", resendKey);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
}

type Result = { data: any; error: any };
async function call(path: string, payload: unknown): Promise<Result> {
  try {
    const res = await resendFetch(path, { method: "POST", body: JSON.stringify(payload) });
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { message: text }; }
    if (!res.ok) {
      return { data: null, error: { statusCode: res.status, name: body?.name ?? "gateway_error", message: body?.message ?? body?.error ?? text } };
    }
    return { data: body, error: null };
  } catch (e) {
    return { data: null, error: { statusCode: 500, name: "network_error", message: e instanceof Error ? e.message : String(e) } };
  }
}

// Drop-in replacement for the subset of the Resend SDK used in this project.
export class Resend {
  constructor(_key?: string) {}
  emails = { send: (p: unknown) => call("/emails", p) };
  batch = { send: (p: unknown) => call("/emails/batch", p) };
}
