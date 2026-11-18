// Conservative spam scoring shared by all public website forms.
// Autofill can fill the hidden trap field, so the trap alone never rejects.
export interface SpamInput {
  text: string;            // all visitor-written text joined
  honeypot?: string | null;
  elapsedMs?: number | null; // time between form display and submit
}

const KEYWORDS = [
  "viagra", "cialis", "casino", "crypto", "bitcoin", "forex", "backlink", "seo service",
  "seo agency", "rank your website", "first page of google", "loan offer", "porn", "escort",
  "betting", "nft", "web design services", "increase your traffic",
];

export function spamReasons({ text, honeypot, elapsedMs }: SpamInput): string[] {
  const reasons: string[] = [];
  const t = (text || "").toLowerCase();
  const urls = (t.match(/https?:\/\/|www\./g) || []).length;
  if (urls >= 3) reasons.push("links");
  if (/\[url=|<a\s+href/i.test(t)) reasons.push("markup");
  if (KEYWORDS.some((k) => t.includes(k))) reasons.push("keywords");
  const letters = t.replace(/[^\p{L}]/gu, "");
  const foreign = (t.match(/[\u0400-\u04FF\u4E00-\u9FFF\u0E00-\u0E7F]/g) || []).length;
  if (letters.length > 20 && foreign / letters.length > 0.3) reasons.push("script");
  if (typeof elapsedMs === "number" && elapsedMs >= 0 && elapsedMs < 2500) reasons.push("too_fast");
  if (honeypot && honeypot.trim() !== "") reasons.push("trap");
  return reasons;
}

export function isSpam(input: SpamInput): boolean {
  const r = spamReasons(input);
  // trap alone may be autofill; require a second signal
  if (r.length === 1 && r[0] === "trap") return false;
  return r.length > 0;
}

export function fieldsText(data: unknown): string {
  if (!data || typeof data !== "object") return String(data ?? "");
  return Object.values(data as Record<string, unknown>)
    .map((v) => (Array.isArray(v) ? v.join(" ") : typeof v === "object" ? "" : String(v ?? "")))
    .join(" \n ");
}
