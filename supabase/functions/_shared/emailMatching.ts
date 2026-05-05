// Utilitaires partagés pour normaliser et matcher des adresses email
// avec les contacts en base. Évite les divergences entre edge functions.

/**
 * Normalisation "stricte" : lowercase + trim + suppression des chevrons et noms.
 * Ex: '"Jean" <Jean.Doe@Gmail.COM>' -> 'jean.doe@gmail.com'
 */
export function normalizeEmail(raw: string | null | undefined): string {
  if (!raw) return '';
  let v = String(raw).trim().toLowerCase();
  const m = v.match(/<([^>]+)>/);
  if (m) v = m[1].trim().toLowerCase();
  // retire les guillemets résiduels
  v = v.replace(/^["']|["']$/g, '').trim();
  return v;
}

/**
 * Normalisation "canonique" pour matching tolérant :
 *  - retire les +aliases (ex: john+promo@gmail.com -> john@gmail.com)
 *  - retire les points dans la partie locale pour gmail/googlemail
 *  - unifie googlemail.com -> gmail.com
 */
export function canonicalEmail(raw: string | null | undefined): string {
  const base = normalizeEmail(raw);
  if (!base.includes('@')) return base;
  let [local, domain] = base.split('@');
  if (!local || !domain) return base;
  // retirer +alias
  const plus = local.indexOf('+');
  if (plus >= 0) local = local.slice(0, plus);
  // unifier googlemail -> gmail
  if (domain === 'googlemail.com') domain = 'gmail.com';
  // retirer les points pour gmail
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

/**
 * Hash SHA-256 hex d'une adresse canonique (utile pour stockage anonymisé
 * et pour fallback de lookup quand seul le hash est connu).
 */
export async function emailHash(raw: string | null | undefined): Promise<string> {
  const c = canonicalEmail(raw);
  if (!c) return '';
  const data = new TextEncoder().encode(c);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Cherche un contact par email avec stratégies en cascade :
 *  1) match exact normalisé
 *  2) match canonique (côté code, sur un set restreint au même domaine)
 * Retourne { contactId, matchType } ou null.
 */
export async function findContactByEmail(
  supabase: any,
  email: string,
  userIdHint?: string,
): Promise<{ contactId: string; matchType: 'exact' | 'canonical' } | null> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) return null;
  const canonical = canonicalEmail(email);
  const domain = normalized.split('@')[1];

  // 1) Exact (insensible à la casse)
  let q = supabase.from('contacts').select('id, email, user_id').ilike('email', normalized);
  if (userIdHint) q = q.eq('user_id', userIdHint);
  const { data: exact } = await q.limit(1);
  if (exact && exact.length > 0) {
    return { contactId: exact[0].id, matchType: 'exact' };
  }

  // 2) Canonical : on récupère les contacts du même domaine et on compare en mémoire
  let q2 = supabase
    .from('contacts')
    .select('id, email, user_id')
    .ilike('email', `%@${domain}`);
  if (userIdHint) q2 = q2.eq('user_id', userIdHint);
  const { data: domainHits } = await q2.limit(200);
  if (domainHits && domainHits.length > 0) {
    for (const c of domainHits) {
      if (canonicalEmail(c.email) === canonical) {
        return { contactId: c.id, matchType: 'canonical' };
      }
    }
  }
  return null;
}
