import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-trigger-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  renotify?: boolean;
  data?: Record<string, unknown>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ---- Crypto helpers for VAPID / Web Push ----

function base64UrlDecode(str: string): Uint8Array {
  const normalized = str.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + pad);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function extractPemBody(pem: string): string | null {
  const match = pem.match(/-----BEGIN(?: EC)? PRIVATE KEY-----([\s\S]+?)-----END(?: EC)? PRIVATE KEY-----/);
  return match?.[1]?.replace(/\s+/g, '') ?? null;
}

async function importPkcs8PrivateKey(privateKeyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    toArrayBuffer(privateKeyBytes),
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );
}

async function importVapidKeys(publicKeyB64: string, privateKeyValue: string) {
  const publicKeyBytes = base64UrlDecode(publicKeyB64);
  const normalizedPrivateKey = privateKeyValue.trim();

  const pemBody = extractPemBody(normalizedPrivateKey);
  if (pemBody) {
    const privateKey = await importPkcs8PrivateKey(base64UrlDecode(pemBody));
    return { privateKey, publicKeyBytes };
  }

  const privateKeyBytes = base64UrlDecode(normalizedPrivateKey);

  try {
    const privateKey = await importPkcs8PrivateKey(privateKeyBytes);
    return { privateKey, publicKeyBytes };
  } catch (_) {
    // Fallback for web-push style raw 32-byte VAPID private keys
  }

  if (privateKeyBytes.length === 32 && publicKeyBytes.length === 65 && publicKeyBytes[0] === 0x04) {
    const x = publicKeyBytes.slice(1, 33);
    const y = publicKeyBytes.slice(33, 65);

    const privateKey = await crypto.subtle.importKey(
      'jwk',
      {
        kty: 'EC',
        crv: 'P-256',
        d: base64UrlEncode(privateKeyBytes),
        x: base64UrlEncode(x),
        y: base64UrlEncode(y),
        ext: true,
        key_ops: ['sign'],
      },
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign']
    );

    return { privateKey, publicKeyBytes };
  }

  throw new Error('Unsupported VAPID private key format');
}

async function createVapidJwt(
  audience: string,
  subject: string,
  privateKey: CryptoKey
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(unsigned)
  );

  const rawSig = derToRaw(new Uint8Array(signature));
  return `${unsigned}.${base64UrlEncode(rawSig)}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  if (der.length === 64) return der;
  let offset = 2;
  if (der[1] & 0x80) offset += (der[1] & 0x7f);
  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;
  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);
  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw;
}

// ---- Encryption (RFC 8291 - aes128gcm) ----

async function encryptPayload(
  payload: string,
  subscriptionKeys: { p256dh: string; auth: string }
): Promise<{ ciphertext: Uint8Array }> {
  const encoder = new TextEncoder();
  const clientPublicKey = base64UrlDecode(subscriptionKeys.p256dh);
  const clientAuth = base64UrlDecode(subscriptionKeys.auth);

  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
  );

  const clientKey = await crypto.subtle.importKey(
    'raw', clientPublicKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientKey },
      localKeyPair.privateKey, 256
    )
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const authInfo = encoder.encode('Content-Encoding: auth\0');
  const ikm = await hkdfDerive(sharedSecret, clientAuth, authInfo, 32);

  const keyInfo = createInfo('aesgcm', clientPublicKey, localPublicKeyRaw);
  const nonceInfo = createInfo('nonce', clientPublicKey, localPublicKeyRaw);
  const contentKey = await hkdfDerive(ikm, salt, keyInfo, 16);
  const nonce = await hkdfDerive(ikm, salt, nonceInfo, 12);

  const paddedPayload = new Uint8Array(2 + encoder.encode(payload).length);
  paddedPayload.set([0, 0]);
  paddedPayload.set(encoder.encode(payload), 2);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', contentKey, { name: 'AES-GCM' }, false, ['encrypt']
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, paddedPayload)
  );

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);

  const body = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length + encrypted.length);
  let offset = 0;
  body.set(salt, offset); offset += 16;
  body.set(rs, offset); offset += 4;
  body[offset++] = localPublicKeyRaw.length;
  body.set(localPublicKeyRaw, offset); offset += localPublicKeyRaw.length;
  body.set(encrypted, offset);

  return { ciphertext: body };
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(`Content-Encoding: ${type}\0`);
  const header = encoder.encode('P-256\0');
  const info = new Uint8Array(typeBytes.length + header.length + 2 + clientPublicKey.length + 2 + serverPublicKey.length);
  let offset = 0;
  info.set(typeBytes, offset); offset += typeBytes.length;
  info.set(header, offset); offset += header.length;
  info[offset++] = 0; info[offset++] = clientPublicKey.length;
  info.set(clientPublicKey, offset); offset += clientPublicKey.length;
  info[offset++] = 0; info[offset++] = serverPublicKey.length;
  info.set(serverPublicKey, offset);
  return info;
}

async function hkdfDerive(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8
  );
  return new Uint8Array(bits);
}

// ---- Main handler ----

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Auth: accept service role key OR internal trigger header
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const triggerSecret = req.headers.get('x-trigger-secret') ?? '';
    
    const isServiceCall = bearerToken === serviceRoleKey;
    const isInternalTrigger = triggerSecret === 'internal-push-trigger';

    let callerUserId: string | null = null;

    if (!isServiceCall && !isInternalTrigger) {
      // Normal user call - verify JWT
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      if (!authHeader) throw new Error('Missing Authorization header');

      const callerClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await callerClient.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');
      callerUserId = user.id;
    }

    const { userId, notification } = await req.json() as {
      userId?: string;
      notification: PushPayload;
    };

    const baseData = notification?.data && typeof notification.data === 'object'
      ? { ...notification.data }
      : {};
    const isSilentBadgeSync = baseData.silentBadgeSync === true;

    if ((!notification?.title || !notification?.body) && !isSilentBadgeSync) {
      throw new Error('Invalid notification payload');
    }

    const targetUserId = userId || callerUserId;
    if (!targetUserId) throw new Error('Missing target user');

    if (!isServiceCall && !isInternalTrigger && userId && userId !== callerUserId) {
      throw new Error('Not authorized to send push to another user');
    }

    console.log(`📬 Sending push to user ${targetUserId}, type: ${notification.data?.type || 'unknown'}`);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Get user's push subscription
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('setting_value')
      .eq('user_id', targetUserId)
      .eq('setting_key', 'push_subscription')
      .single();

    if (settingsError || !settings) {
      console.log('⚠️ No push subscription for user', targetUserId);
      return new Response(
        JSON.stringify({ success: false, message: 'No push subscription found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const subscription: PushSubscriptionData = JSON.parse(settings.setting_value);

    const normalizedTitle = notification.title || 'Synchronisation badge';
    const normalizedBody = notification.body || 'Mise à jour du badge en arrière-plan';

    const rawBadgeCount = (baseData as Record<string, unknown>).badgeCount;
    let badgeCount = typeof rawBadgeCount === 'number' && Number.isFinite(rawBadgeCount)
      ? Math.max(0, Math.floor(rawBadgeCount))
      : 0;

    if (badgeCount === 0) {
      const [generalRes, emailRes] = await Promise.all([
        supabaseAdmin
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('read', false),
        supabaseAdmin
          .from('email_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('is_read', false),
      ]);
      badgeCount = Math.max(0, (generalRes.count ?? 0) + (emailRes.count ?? 0));
      if (badgeCount === 0) badgeCount = 1; // fallback: at least 1 since we're sending a notif
    }

    // VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!vapidPublicKey || !vapidPrivateKey) throw new Error('VAPID keys not configured');

    const pushPayload = JSON.stringify({
      title: normalizedTitle,
      body: normalizedBody,
      icon: notification.icon || '/favicon.png',
      badge: notification.badge || '/favicon.png',
      tag: notification.tag || 'notification',
      requireInteraction: notification.requireInteraction ?? !isSilentBadgeSync,
      renotify: notification.renotify ?? !isSilentBadgeSync,
      data: { ...baseData, badgeCount, silentBadgeSync: isSilentBadgeSync },
    });

    const { ciphertext } = await encryptPayload(pushPayload, subscription.keys);

    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    const { privateKey, publicKeyBytes } = await importVapidKeys(vapidPublicKey, vapidPrivateKey);
    const jwt = await createVapidJwt(audience, 'mailto:contact@fatras-booking.fr', privateKey);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': ciphertext.length.toString(),
        'TTL': '86400',
        'Urgency': isSilentBadgeSync ? 'normal' : 'high',
        'Authorization': `vapid t=${jwt}, k=${base64UrlEncode(publicKeyBytes)}`,
      },
      body: ciphertext,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push service response:', response.status, errorText);

      if (response.status === 404 || response.status === 410) {
        await supabaseAdmin
          .from('app_settings')
          .delete()
          .eq('user_id', targetUserId)
          .eq('setting_key', 'push_subscription');
        console.log('🗑️ Cleaned up expired subscription');
        return new Response(
          JSON.stringify({ success: false, message: 'Subscription expired, cleaned up' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      throw new Error(`Push failed: ${response.status} ${errorText}`);
    }

    console.log('✅ Push notification sent successfully, badge:', badgeCount);

    return new Response(
      JSON.stringify({ success: true, message: 'Push notification sent', badgeCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error sending push notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
