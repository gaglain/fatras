import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImapSyncRequest {
  userId: string;
  action: 'sync' | 'test_connection';
  forceSyncSince?: string; // ISO date string to force sync from a specific date
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action, forceSyncSince }: ImapSyncRequest = await req.json();
    
    if (!userId) {
      throw new Error('userId is required');
    }

    console.log('📧 IMAP sync request:', { userId, action });

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer la configuration IMAP depuis les préférences utilisateur
    const { data: imapSettings } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('user_id', userId)
      .in('setting_key', ['imap_host', 'imap_port', 'imap_username', 'imap_password', 'imap_security']);

    const settingsMap = imapSettings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    const imapHost = settingsMap.imap_host;
    const imapPort = parseInt(settingsMap.imap_port || '993');
    const imapUsername = settingsMap.imap_username;
    const imapPassword = settingsMap.imap_password;
    // Correction: port 993 = TLS direct, port 143 = STARTTLS
    const imapSecurity = settingsMap.imap_security?.toLowerCase() || (imapPort === 143 ? 'starttls' : 'tls');

    console.log('📧 Configuration IMAP:', { host: imapHost, port: imapPort, user: imapUsername, security: imapSecurity });

    if (!imapHost || !imapUsername || !imapPassword) {
      throw new Error('Configuration IMAP manquante dans les préférences utilisateur');
    }

    // Établir la connexion IMAP (TLS implicite 993 ou STARTTLS 143)
    console.log('🔗 Connecting to IMAP server...');
    let conn: Deno.Conn;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const useStartTls = imapSecurity === 'starttls' && imapPort === 143;

    if (useStartTls) {
      // Plain TCP d'abord, on passera en TLS avec STARTTLS ensuite
      conn = await Deno.connect({
        hostname: imapHost,
        port: imapPort || 143,
      });
    } else {
      // TLS implicite
      conn = await Deno.connectTls({
        hostname: imapHost,
        port: imapPort || 993,
        serverName: imapHost,
      });
    }

    // Helper pour lire la réponse IMAP avec timeout
    const readResponse = async (timeoutMs: number = 10000): Promise<string> => {
      const chunks: Uint8Array[] = [];
      const buffer = new Uint8Array(8192);
      
      const readPromise = (async () => {
        try {
          let totalBytes = 0;
          const startTime = Date.now();
          
          while (true) {
            // Vérifier le timeout
            if (Date.now() - startTime > timeoutMs) {
              throw new Error('IMAP read timeout');
            }
            
            const n = await conn.read(buffer);
            if (n === null) break;
            
            const chunk = buffer.subarray(0, n);
            chunks.push(chunk.slice());
            totalBytes += n;
            
            // Vérifier si on a reçu la fin d'une réponse IMAP
            const text = decoder.decode(chunk);
            if (text.includes('\r\n') && totalBytes > 0) {
              // Vérifier si c'est une réponse complète (commence par un tag ou *)
              const fullText = chunks.map(c => decoder.decode(c)).join('');
              if (fullText.match(/^(\* |\w+ )/m)) {
                break;
              }
            }
            
            // Limite de sécurité
            if (totalBytes > 65536) break;
          }
          
          // Concaténer tous les chunks
          const allBytes = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            allBytes.set(chunk, offset);
            offset += chunk.length;
          }
          
          return decoder.decode(allBytes);
        } catch (error) {
          console.error('Error reading IMAP response:', error);
          throw error;
        }
      })();
      
      return readPromise;
    };

    // Helper pour envoyer une commande IMAP
    let commandTag = 1;
    const sendCommand = async (command: string): Promise<string> => {
      const tag = `A${commandTag.toString().padStart(3, '0')}`;
      commandTag++;
      const fullCommand = `${tag} ${command}`;
      
      console.log('→', fullCommand.replace(/LOGIN .+ .+/, 'LOGIN [hidden]'));
      await conn.write(encoder.encode(fullCommand + '\r\n'));
      
      let response = '';
      let lines: string[] = [];
      
      // Lire jusqu'à avoir la réponse complète avec le tag
      while (true) {
        const data = await readResponse();
        response += data;
        lines = response.split('\r\n');
        
        // Chercher la ligne de réponse finale avec notre tag
        const finalResponse = lines.find(line => line.startsWith(`${tag} `));
        if (finalResponse) {
          console.log('←', response.trim());
          return response;
        }
      }
    };

    try {
      // Lire le message d'accueil avec timeout de 5 secondes
      let response = '';
      try {
        response = await readResponse(5000);
        console.log('👋 Server greeting:', response.trim());
      } catch (error) {
        console.error('❌ Failed to read greeting:', error);
        throw new Error(`IMAP connection failed: Unable to read server greeting. Error: ${error.message}`);
      }

      // Vérifier que le serveur est prêt (accepte * OK ou * PREAUTH)
      if (!response.includes('* OK') && !response.includes('* PREAUTH')) {
        throw new Error(`IMAP server not ready. Server response: ${response || '(empty)'}`);
      }

      // Si STARTTLS est requis, on l'initialise maintenant puis on relance CAPABILITY
      if (useStartTls) {
        response = await sendCommand('STARTTLS');
        if (!/\bOK\b/.test(response)) {
          throw new Error(`STARTTLS failed: ${response}`);
        }
        // Passage en TLS sur la connexion existante
        // @ts-ignore - Deno.startTls existe dans l'environnement des Edge Functions
        // et renvoie une connexion compatible avec Deno.Conn
        // Certains environnements n'exposent pas les types, mais l'API est disponible à l'exécution
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        conn = await Deno.startTls(conn, { hostname: imapHost, port: imapPort || 143, serverName: imapHost });
        // Après STARTTLS, la RFC recommande de renvoyer CAPABILITY
      }

      // CAPABILITY
      response = await sendCommand('CAPABILITY');
      if (!/\bOK\b/.test(response)) {
        throw new Error(`CAPABILITY failed: ${response}`);
      }

      // Authenticate using LOGIN
      console.log('📝 Authenticating...');
      const loginResponse = await sendCommand(`LOGIN "${imapUsername}" "${imapPassword}"`);
      
      if (!loginResponse.includes('OK')) {
        console.error('❌ IMAP authentication failed:', loginResponse);
        throw new Error(`IMAP authentication failed. Please verify your username and password.`);
      }

      console.log('✅ IMAP authentication successful');

      if (action === 'test_connection') {
        // Test de connexion simple
        response = await sendCommand('LIST "" "*"');
        await sendCommand('LOGOUT');
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Connexion IMAP réussie'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Fonction pour décoder les encoded-words MIME (RFC 2047)
      const decodeMimeWord = (text: string): string => {
        if (!text) return text;
        return text.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (m, charset, encoding, encoded) => {
          try {
            const enc = encoding.toUpperCase();
            let bytes: Uint8Array;
            if (enc === 'B') {
              const binary = atob(encoded);
              bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            } else {
              // Quoted-Printable
              const decoded = encoded.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
              const binary = unescape(encodeURIComponent(decoded));
              bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            }
            // Decode bytes as UTF-8
            const td = new TextDecoder(charset.toLowerCase().replace('windows-', 'windows').replace('iso-8859-1', 'latin1') || 'utf-8', { fatal: false });
            return td.decode(bytes);
          } catch (_e) {}
          return m;
        });
      };

      const decodeBodyContent = (body: string, encoding = '', charset = 'utf-8'): string => {
        try {
          const normalizedEncoding = encoding.toLowerCase();
          let bytes: Uint8Array;
          if (normalizedEncoding.includes('base64')) {
            const binary = atob(body.replace(/\s/g, ''));
            bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          } else if (normalizedEncoding.includes('quoted-printable')) {
            const qp = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
            bytes = new Uint8Array(qp.length);
            for (let i = 0; i < qp.length; i++) bytes[i] = qp.charCodeAt(i);
          } else {
            bytes = new TextEncoder().encode(body);
          }
          return new TextDecoder(charset.toLowerCase().replace('windows-', 'windows').replace('iso-8859-1', 'latin1'), { fatal: false }).decode(bytes).trim();
        } catch (_e) {
          return body.trim();
        }
      };

      const parseMimeContent = (rawEmail: string): { content: string; html_content: string } => {
        const headerSeparator = rawEmail.match(/\r?\n\r?\n/);
        const splitIndex = headerSeparator?.index ?? -1;
        if (splitIndex < 0) return { content: '', html_content: '' };

        const rawHeaders = rawEmail.slice(0, splitIndex);
        const body = rawEmail.slice(splitIndex + headerSeparator![0].length);
        const contentType = rawHeaders.match(/^Content-Type:\s*([^\r\n]+(?:\r?\n[ \t]+[^\r\n]+)*)/im)?.[1]?.replace(/\r?\n[ \t]+/g, ' ') || 'text/plain';
        const transferEncoding = rawHeaders.match(/^Content-Transfer-Encoding:\s*([^\r\n]+)/im)?.[1] || '';
        const charset = contentType.match(/charset="?([^";\s]+)"?/i)?.[1] || 'utf-8';
        const boundary = contentType.match(/boundary="?([^";]+)"?/i)?.[1];

        if (!boundary) {
          const decoded = decodeBodyContent(body, transferEncoding, charset);
          return /text\/html/i.test(contentType)
            ? { content: decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), html_content: decoded }
            : { content: decoded, html_content: '' };
        }

        const parts = body.split(`--${boundary}`).filter(part => part.trim() && !part.trim().startsWith('--'));
        let text = '';
        let html = '';
        for (const part of parts) {
          const nested = parseMimeContent(part.replace(/^\r?\n/, ''));
          if (nested.html_content && !html) html = nested.html_content;
          if (nested.content && !text) text = nested.content;
        }
        return { content: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), html_content: html };
      };

      // Fonction pour parser les emails d'une réponse FETCH
      const parseEmailsFromResponse = (fetchResponse: string, folder: string): any[] => {
        const emails: any[] = [];
        
        const isSentFolder = folder.toLowerCase().includes('sent') || 
                             folder.toLowerCase().includes('envoy');

        // Split response into individual message blocks using FETCH markers
        const fetchRegex = /^\* \d+ FETCH /gm;
        const fetchPositions: number[] = [];
        let match;
        while ((match = fetchRegex.exec(fetchResponse)) !== null) {
          fetchPositions.push(match.index);
        }

        for (let i = 0; i < fetchPositions.length; i++) {
          const start = fetchPositions[i];
          const end = i + 1 < fetchPositions.length ? fetchPositions[i + 1] : fetchResponse.length;
          const block = fetchResponse.substring(start, end);

          const literalMatch = block.match(/(?:BODY\[\]|RFC822|BODY\[HEADER\])\s*\{(\d+)\}\r\n/);
          if (!literalMatch) continue;

          const literalSize = parseInt(literalMatch[1]);
          const literalStart = block.indexOf(literalMatch[0]) + literalMatch[0].length;
          const rawEmail = block.substring(literalStart, literalStart + literalSize);
          const rawHeaders = rawEmail.split(/\r?\n\r?\n/, 1)[0];
          const parsedContent = parseMimeContent(rawEmail);

          // Parse fields from raw headers
          const messageIdMatch = rawHeaders.match(/^Message-ID:\s*<?([^>\s\r\n]+)>?/im);
          const fromMatch = rawHeaders.match(/^From:\s*(?:"?([^"<\r\n]*)"?\s*)?<?([^>\r\n\s]+@[^>\r\n\s]+)>?/im);
          const toMatch = rawHeaders.match(/^To:\s*(?:"?([^"<\r\n]*)"?\s*)?<?([^>\r\n\s]+@[^>\r\n\s]+)>?/im);
          const subjectMatch = rawHeaders.match(/^Subject:\s*([^\r\n]+(?:\r\n[ \t]+[^\r\n]+)*)/im);
          const dateMatch = rawHeaders.match(/^Date:\s*([^\r\n]+)/im);

          if (!messageIdMatch || !fromMatch) continue;

          let subject = '';
          if (subjectMatch) {
            subject = subjectMatch[1].replace(/\r\n[ \t]+/g, ' ').trim();
            subject = decodeMimeWord(subject);
          }

          const fromName = decodeMimeWord(fromMatch[1]?.trim() || '');

          let receivedAt = new Date().toISOString();
          if (dateMatch) {
            try {
              const parsed = new Date(dateMatch[1].trim());
              if (!isNaN(parsed.getTime())) receivedAt = parsed.toISOString();
            } catch (_e) {}
          }

          emails.push({
            user_id: userId,
            provider: 'imap',
            message_id: messageIdMatch[1].trim(),
            from_email: fromMatch[2]?.trim().toLowerCase() || '',
            from_name: fromName,
            to_email: toMatch?.[2]?.trim().toLowerCase() || '',
            subject,
            content: parsedContent.content,
            html_content: parsedContent.html_content,
            received_at: receivedAt,
            direction: isSentFolder ? 'sent' : 'received',
            labels: [folder]
          });
        }
        
        return emails;
      };

      // Récupérer la date du dernier email synchronisé pour synchro incrémentale
      const { data: lastEmail } = await supabase
        .from('emails')
        .select('received_at')
        .eq('user_id', userId)
        .eq('direction', 'received')
        .eq('provider', 'imap')
        .order('received_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If forceSyncSince is provided, use it instead of the last email date
      let lastSyncDate: Date;
      if (forceSyncSince) {
        lastSyncDate = new Date(forceSyncSince);
        console.log(`🔄 Force sync since: ${forceSyncSince}`);
      } else {
        lastSyncDate = lastEmail?.received_at 
          ? new Date(lastEmail.received_at) 
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut
      }

      // Fonction pour synchroniser un dossier avec SEARCH SINCE
      const syncFolder = async (folderName: string): Promise<{ syncedCount: number; totalMessages: number; emails: any[] }> => {
        try {
          response = await sendCommand(`SELECT "${folderName}"`);
          if (!response.includes('OK')) {
            console.log(`⚠️ Could not select folder ${folderName}`);
            return { syncedCount: 0, totalMessages: 0, emails: [] };
          }

          const existsMatch = response.match(/\* (\d+) EXISTS/);
          const totalMessages = existsMatch ? parseInt(existsMatch[1]) : 0;
          
          console.log(`📨 Total messages in ${folderName}: ${totalMessages}`);

          if (totalMessages === 0) {
            return { syncedCount: 0, totalMessages: 0, emails: [] };
          }

          // Utiliser SEARCH SINCE pour synchro incrémentale
          const sinceDate = lastSyncDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '');
          // Format IMAP: DD-Mon-YYYY
          const imapDate = `${lastSyncDate.getUTCDate()}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][lastSyncDate.getUTCMonth()]}-${lastSyncDate.getUTCFullYear()}`;
          
          console.log(`🔍 Searching messages SINCE ${imapDate} in ${folderName}`);
          response = await sendCommand(`SEARCH SINCE ${imapDate}`);
          
          const searchMatch = response.match(/\* SEARCH([\d\s]*)/);
          const messageNums = searchMatch?.[1]?.trim().split(/\s+/).filter(Boolean) || [];
          
          if (messageNums.length === 0) {
            console.log(`📭 No messages since ${imapDate} in ${folderName}`);
            return { syncedCount: 0, totalMessages, emails: [] };
          }

          // Limiter à 200 messages max pour éviter les timeouts
          const msgsToFetch = messageNums.slice(-200);
          const fetchRange = msgsToFetch.join(',');
          
          console.log(`🔍 Fetching ${msgsToFetch.length} messages from ${folderName}`);
          response = await sendCommand(`FETCH ${fetchRange} (FLAGS ENVELOPE BODY.PEEK[])`);
          
          const emails = parseEmailsFromResponse(response, folderName);
          console.log(`📧 ${emails.length} emails parsés depuis ${folderName}`);

          return { syncedCount: 0, totalMessages, emails };
        } catch (error) {
          console.error(`❌ Error syncing folder ${folderName}:`, error);
          return { syncedCount: 0, totalMessages: 0, emails: [] };
        }
      };

      // Synchroniser INBOX (emails reçus)
      console.log('📥 Synchronisation INBOX...');
      const inboxResult = await syncFolder('INBOX');
      const inboxEmails = inboxResult.emails;

      // Découvrir le dossier Envoyés via LIST
      console.log('📤 Découverte du dossier Envoyés...');
      response = await sendCommand('LIST "" "*"');
      
      // Chercher un dossier avec l'attribut \Sent ou un nom connu
      const listLines = response.split('\r\n');
      let sentFolderName = '';
      
      for (const line of listLines) {
        // Priorité 1: attribut \Sent (standard IMAP)
        if (line.includes('\\Sent') && !line.includes('\\Noselect')) {
          const folderMatch = line.match(/"\/" "?([^"\r\n]+)"?\s*$/);
          if (folderMatch) {
            sentFolderName = folderMatch[1].replace(/"/g, '');
            console.log(`✅ Found sent folder by attribute: ${sentFolderName}`);
            break;
          }
        }
      }

      // Priorité 2: chercher par nom si pas trouvé par attribut
      if (!sentFolderName) {
        const sentPatterns = [/sent/i, /envoy/i, /éléments envoyés/i];
        for (const line of listLines) {
          if (line.includes('\\Noselect')) continue;
          const folderMatch = line.match(/"\/" "?([^"\r\n]+)"?\s*$/);
          if (folderMatch) {
            const name = folderMatch[1].replace(/"/g, '');
            for (const pattern of sentPatterns) {
              if (pattern.test(name)) {
                sentFolderName = name;
                console.log(`✅ Found sent folder by name: ${sentFolderName}`);
                break;
              }
            }
            if (sentFolderName) break;
          }
        }
      }
      
      let sentEmails: any[] = [];
      if (sentFolderName) {
        const sentResult = await syncFolder(sentFolderName);
        sentEmails = sentResult.emails;
      } else {
        console.log('⚠️ No sent folder found on this server');
      }

      // Sauvegarder les emails reçus - utiliser upsert pour éviter les doublons
      let syncedInbox = 0;
      for (const email of inboxEmails) {
        try {
          // Upsert dans inbound_emails (ignore si message_id existe déjà)
          const { error: inboundError } = await supabase
            .from('inbound_emails')
            .upsert(email, { 
              onConflict: 'message_id,user_id',
              ignoreDuplicates: true 
            });
          
          if (inboundError && !inboundError.message?.includes('duplicate')) {
            console.error('⚠️ Erreur upsert inbound_email:', inboundError);
          }
          
          // Trouver le contact correspondant à l'expéditeur
          const { data: contact } = await supabase
            .from('contacts')
            .select('id')
            .ilike('email', email.from_email)
            .maybeSingle();

          // Upsert dans emails - utiliser insert avec check pour voir si c'est nouveau
          const { data: insertedEmail, error: emailError } = await supabase
            .from('emails')
            .upsert({
              user_id: userId,
              message_id: email.message_id,
              from_email: email.from_email,
              from_name: email.from_name,
              to_email: email.to_email,
              subject: email.subject,
              content: email.content || '',
              html_content: email.html_content || '',
              direction: 'received',
              status: 'delivered',
              provider: 'imap',
              received_at: email.received_at,
              contact_id: contact?.id || null,
              labels: email.labels,
              is_read: false
            }, { 
              onConflict: 'message_id,user_id',
              ignoreDuplicates: true 
            })
            .select('id')
            .maybeSingle();
          
          if (insertedEmail && !emailError) {
            syncedInbox++;
          }
        } catch (error) {
          console.error('❌ Erreur traitement email INBOX:', error);
        }
      }

      // Sauvegarder les emails envoyés dans emails table
      let syncedSent = 0;
      for (const email of sentEmails) {
        try {
          const { data: existing } = await supabase
            .from('emails')
            .select('id')
            .eq('message_id', email.message_id)
            .eq('user_id', userId)
            .single();
          
          if (!existing) {
            const { data: contact } = await supabase
              .from('contacts')
              .select('id')
              .ilike('email', email.to_email)
              .single();

            const { error: insertError } = await supabase
              .from('emails')
              .insert({
                user_id: userId,
                message_id: email.message_id,
                from_email: email.from_email,
                from_name: email.from_name,
                to_email: email.to_email,
                subject: email.subject,
                content: email.content || '',
                html_content: email.html_content || '',
                direction: 'sent',
                status: 'delivered',
                provider: 'imap',
                sent_at: email.received_at,
                contact_id: contact?.id || null,
                labels: email.labels
              });
            
            if (!insertError) {
              syncedSent++;
            } else {
              console.error('❌ Erreur insertion email envoyé:', insertError);
            }
          }
        } catch (error) {
          console.error('❌ Erreur traitement email envoyé:', error);
        }
      }

      // LOGOUT
      await sendCommand('LOGOUT');

      const totalSynced = syncedInbox + syncedSent;
      console.log(`✅ Sync terminé: ${syncedInbox} reçus, ${syncedSent} envoyés`);
      
      return new Response(JSON.stringify({ 
        success: true,
        syncedCount: totalSynced,
        syncedInbox,
        syncedSent,
        totalInbox: inboxEmails.length,
        totalSent: sentEmails.length,
        message: `${syncedInbox} emails reçus et ${syncedSent} emails envoyés synchronisés`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } finally {
      try {
        conn.close();
      } catch (e) {
        // Ignorer les erreurs de fermeture
      }
    }

  } catch (error: any) {
    console.error('❌ Error in IMAP sync:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);