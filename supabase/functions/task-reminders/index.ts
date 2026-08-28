import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRow {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
  user_id: string;
  assigned_to: string | null;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// ---- Crypto helpers (same as send-push-notification) ----

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function convertRawPrivateKeyToPKCS8(raw: Uint8Array): ArrayBuffer {
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20,
  ]);
  const result = new Uint8Array(pkcs8Header.length + 32);
  result.set(pkcs8Header);
  result.set(raw.slice(0, 32), pkcs8Header.length);
  return result.buffer;
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const publicKeyBytes = base64UrlDecode(publicKeyB64);
  const privateKeyBytes = base64UrlDecode(privateKeyB64);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    convertRawPrivateKeyToPKCS8(privateKeyBytes),
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );
  return { privateKey, publicKeyBytes };
}

async function createVapidJwt(audience: string, subject: string, privateKey: CryptoKey): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };
  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, encoder.encode(unsigned));
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
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

async function encryptPayload(payload: string, subscriptionKeys: { p256dh: string; auth: string }): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const clientPublicKey = base64UrlDecode(subscriptionKeys.p256dh);
  const clientAuth = base64UrlDecode(subscriptionKeys.auth);
  const localKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));
  const clientKey = await crypto.subtle.importKey('raw', clientPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: clientKey }, localKeyPair.privateKey, 256));
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
  const cryptoKey = await crypto.subtle.importKey('raw', contentKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, paddedPayload));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const body = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length + encrypted.length);
  let offset = 0;
  body.set(salt, offset); offset += 16;
  body.set(rs, offset); offset += 4;
  body[offset++] = localPublicKeyRaw.length;
  body.set(localPublicKeyRaw, offset); offset += localPublicKeyRaw.length;
  body.set(encrypted, offset);
  return body;
}

async function sendPushToUser(
  _supabase: any,
  userId: string,
  notification: { title: string; body: string; tag: string; data?: Record<string, unknown> },
  _vapidPublicKey: string,
  _vapidPrivateKey: string
): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`Push failed for user ${userId}: missing Supabase credentials`);
      return false;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        userId,
        notification: {
          title: notification.title,
          body: notification.body,
          tag: notification.tag,
          data: notification.data || {},
        },
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`Push failed for user ${userId}:`, response.status, responseText);
      return false;
    }

    if (!responseText) return true;

    try {
      const payload = JSON.parse(responseText) as { success?: boolean };
      return payload.success !== false;
    } catch {
      return true;
    }
  } catch (e) {
    console.error(`Push failed for user ${userId}:`, e);
    return false;
  }
}

async function sendEmailSummary(
  supabase: any,
  userId: string,
  email: string,
  userName: string,
  overdueTasks: TaskRow[],
  dueSoonTasks: TaskRow[]
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) return false;

  const priorityLabels: Record<string, string> = {
    urgent: '🔴 Urgente',
    high: '🟠 Haute',
    medium: '🟡 Moyenne',
    low: '🟢 Basse',
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const overdueHtml = overdueTasks.length > 0
    ? `<h3 style="color:#dc2626;margin:16px 0 8px">⚠️ Tâches en retard (${overdueTasks.length})</h3>
       <table style="width:100%;border-collapse:collapse">
         <tr style="background:#fef2f2"><th style="text-align:left;padding:8px;border-bottom:1px solid #fecaca">Tâche</th><th style="text-align:left;padding:8px;border-bottom:1px solid #fecaca">Priorité</th><th style="text-align:left;padding:8px;border-bottom:1px solid #fecaca">Échéance</th></tr>
         ${overdueTasks.map(t => `<tr><td style="padding:8px;border-bottom:1px solid #f5f5f5">${t.title}</td><td style="padding:8px;border-bottom:1px solid #f5f5f5">${priorityLabels[t.priority] || t.priority}</td><td style="padding:8px;border-bottom:1px solid #f5f5f5">${formatDate(t.due_date)}</td></tr>`).join('')}
       </table>`
    : '';

  const dueSoonHtml = dueSoonTasks.length > 0
    ? `<h3 style="color:#d97706;margin:16px 0 8px">⏰ Tâches à venir (${dueSoonTasks.length})</h3>
       <table style="width:100%;border-collapse:collapse">
         <tr style="background:#fffbeb"><th style="text-align:left;padding:8px;border-bottom:1px solid #fde68a">Tâche</th><th style="text-align:left;padding:8px;border-bottom:1px solid #fde68a">Priorité</th><th style="text-align:left;padding:8px;border-bottom:1px solid #fde68a">Échéance</th></tr>
         ${dueSoonTasks.map(t => `<tr><td style="padding:8px;border-bottom:1px solid #f5f5f5">${t.title}</td><td style="padding:8px;border-bottom:1px solid #f5f5f5">${priorityLabels[t.priority] || t.priority}</td><td style="padding:8px;border-bottom:1px solid #f5f5f5">${formatDate(t.due_date)}</td></tr>`).join('')}
       </table>`
    : '';

  const totalCount = overdueTasks.length + dueSoonTasks.length;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fatras Booking <noreply@fatras.net>',
        to: [email],
        subject: `📋 ${totalCount} tâche(s) nécessitent votre attention`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#1f2937">Bonjour ${userName || 'là'} 👋</h2>
            <p style="color:#4b5563">Voici le récapitulatif de vos tâches qui nécessitent votre attention :</p>
            ${overdueHtml}
            ${dueSoonHtml}
            <div style="margin-top:24px;text-align:center">
              <a href="https://booking.fatras.net/tasks" style="display:inline-block;background:#1632f4;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Voir mes tâches</a>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">Vous recevez cet email car vous avez activé les rappels de tâches par email.</p>
          </div>
        `,
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(`Email failed for ${email}:`, e);
    return false;
  }
}

// ---- Main handler ----

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role for server-side cron
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    const today = now.toISOString().split('T')[0];

    // Get all overdue tasks
    const { data: overdueTasks, error: overdueErr } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status, user_id, assigned_to')
      .not('status', 'in', '(completed,cancelled)')
      .not('due_date', 'is', null)
      .lt('due_date', now.toISOString());

    if (overdueErr) throw overdueErr;

    // Get tasks due within 24h
    const { data: dueSoonTasks, error: dueSoonErr } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status, user_id, assigned_to')
      .not('status', 'in', '(completed,cancelled)')
      .not('due_date', 'is', null)
      .gte('due_date', now.toISOString())
      .lt('due_date', tomorrow.toISOString());

    if (dueSoonErr) throw dueSoonErr;

    // Group tasks by user (owner + assigned)
    const userTasksMap = new Map<string, { overdue: TaskRow[]; dueSoon: TaskRow[] }>();

    const addToUser = (userId: string, task: TaskRow, type: 'overdue' | 'dueSoon') => {
      if (!userId) return;
      if (!userTasksMap.has(userId)) userTasksMap.set(userId, { overdue: [], dueSoon: [] });
      userTasksMap.get(userId)![type].push(task);
    };

    for (const task of (overdueTasks || []) as TaskRow[]) {
      addToUser(task.user_id, task, 'overdue');
      if (task.assigned_to && task.assigned_to !== task.user_id) {
        addToUser(task.assigned_to, task, 'overdue');
      }
    }

    for (const task of (dueSoonTasks || []) as TaskRow[]) {
      addToUser(task.user_id, task, 'dueSoon');
      if (task.assigned_to && task.assigned_to !== task.user_id) {
        addToUser(task.assigned_to, task, 'dueSoon');
      }
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

    let pushSent = 0;
    let emailsSent = 0;

    for (const [userId, tasks] of userTasksMap.entries()) {
      const totalTasks = tasks.overdue.length + tasks.dueSoon.length;
      if (totalTasks === 0) continue;

      // Check user preferences for task email notifications
      const { data: emailPref } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('user_id', userId)
        .eq('setting_key', 'notify_task_reminders_by_email')
        .single();

      const emailEnabled = emailPref?.setting_value === 'true';

      // Send push notification summary
      const pushBody = tasks.overdue.length > 0
        ? `${tasks.overdue.length} en retard, ${tasks.dueSoon.length} à venir`
        : `${tasks.dueSoon.length} tâche(s) arrivent à échéance`;

      const pushOk = await sendPushToUser(supabase, userId, {
        title: `📋 ${totalTasks} tâche(s) à traiter`,
        body: pushBody,
        tag: `task-reminder-${today}`,
        data: { url: '/tasks' },
      }, vapidPublicKey, vapidPrivateKey);

      if (pushOk) pushSent++;

      // Send email summary if enabled
      if (emailEnabled) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email, first_name')
          .eq('user_id', userId)
          .single();

        if (profile?.email) {
          // Check if email already sent today
          const { data: existingEmail } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'task_email_reminder')
            .gte('created_at', `${today}T00:00:00Z`)
            .limit(1);

          if (!existingEmail?.length) {
            const emailOk = await sendEmailSummary(
              supabase,
              userId,
              profile.email,
              profile.first_name || '',
              tasks.overdue,
              tasks.dueSoon
            );

            if (emailOk) {
              emailsSent++;
              // Track that email was sent today
              await supabase.from('notifications').insert({
                user_id: userId,
                type: 'task_email_reminder',
                title: 'Récapitulatif tâches envoyé par email',
                message: `${totalTasks} tâche(s) signalée(s)`,
                read: true,
                data: { date: today },
              });
            }
          }
        }
      }
    }

    console.log(`✅ Task reminders: ${pushSent} push, ${emailsSent} emails sent to ${userTasksMap.size} users`);

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed: userTasksMap.size,
        pushSent,
        emailsSent,
        overdueTasks: (overdueTasks || []).length,
        dueSoonTasks: (dueSoonTasks || []).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Task reminders error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
