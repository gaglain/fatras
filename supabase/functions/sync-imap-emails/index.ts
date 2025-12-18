import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImapSyncRequest {
  userId: string;
  action: 'sync' | 'test_connection';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action }: ImapSyncRequest = await req.json();
    
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

      // Fonction pour parser les emails d'une réponse FETCH
      const parseEmailsFromResponse = (fetchResponse: string, folder: string): any[] => {
        const emails: any[] = [];
        const messageLines = fetchResponse.split('\r\n');
        
        let currentMessage: any = null;
        let currentHeaders = '';
        let inHeaders = false;
        let headerBytesRemaining = 0;
        
        for (let i = 0; i < messageLines.length; i++) {
          const line = messageLines[i];
          
          const fetchMatch = line.match(/^\* (\d+) FETCH/);
          if (fetchMatch) {
            if (currentMessage && currentMessage.message_id && currentMessage.from_email) {
              emails.push(currentMessage);
            }
            
            const isSentFolder = folder.toLowerCase().includes('sent') || 
                                 folder.toLowerCase().includes('envoy');
            
            currentMessage = {
              user_id: userId,
              provider: 'imap',
              message_id: '',
              from_email: '',
              from_name: '',
              to_email: '',
              subject: '',
              content: '',
              html_content: '',
              received_at: new Date().toISOString(),
              direction: isSentFolder ? 'sent' : 'received',
              labels: [folder]
            };
            currentHeaders = '';
            inHeaders = false;
            headerBytesRemaining = 0;
            
            const headerStartMatch = line.match(/BODY\[HEADER\]\s*\{(\d+)\}/);
            if (headerStartMatch) {
              headerBytesRemaining = parseInt(headerStartMatch[1]);
              inHeaders = true;
            }
            continue;
          }
          
          if (!inHeaders && line.includes('BODY[HEADER]')) {
            const headerMatch = line.match(/BODY\[HEADER\]\s*\{(\d+)\}/);
            if (headerMatch) {
              headerBytesRemaining = parseInt(headerMatch[1]);
              inHeaders = true;
              continue;
            }
          }
          
          if (inHeaders && currentMessage) {
            currentHeaders += line + '\r\n';
            
            const lineEndMatch = line.match(/\)$/);
            const emptyLineAfterHeaders = line.trim() === '' && currentHeaders.includes('Message-ID');
            
            if (lineEndMatch || emptyLineAfterHeaders || currentHeaders.length > headerBytesRemaining + 200) {
              const messageIdMatch = currentHeaders.match(/Message-ID:\s*<?([^>\s\r\n]+)>?/i);
              const fromMatch = currentHeaders.match(/From:\s*(?:"?([^"<\r\n]*)"?\s*)?<?([^>\r\n\s]+@[^>\r\n\s]+)>?/i);
              const toMatch = currentHeaders.match(/To:\s*(?:"?([^"<\r\n]*)"?\s*)?<?([^>\r\n\s]+@[^>\r\n\s]+)>?/i);
              const subjectMatch = currentHeaders.match(/Subject:\s*([^\r\n]+(?:\r\n\s+[^\r\n]+)*)/i);
              const dateMatch = currentHeaders.match(/Date:\s*([^\r\n]+)/i);
              
              if (messageIdMatch) {
                currentMessage.message_id = messageIdMatch[1].trim();
              }
              
              if (fromMatch) {
                currentMessage.from_name = fromMatch[1]?.trim() || '';
                currentMessage.from_email = fromMatch[2]?.trim().toLowerCase() || '';
              }
              
              if (toMatch) {
                currentMessage.to_email = toMatch[2]?.trim().toLowerCase() || '';
              }
              
              if (subjectMatch) {
                let subject = subjectMatch[1].replace(/\r\n\s+/g, ' ').trim();
                subject = subject.replace(/=\?[^?]+\?[BQ]\?[^?]+\?=/gi, (match) => {
                  try {
                    const parts = match.split('?');
                    if (parts.length >= 4) {
                      const encoding = parts[2].toUpperCase();
                      const encoded = parts[3];
                      if (encoding === 'B') {
                        return atob(encoded);
                      } else if (encoding === 'Q') {
                        return encoded.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_, hex) => 
                          String.fromCharCode(parseInt(hex, 16))
                        );
                      }
                    }
                  } catch (e) {}
                  return match;
                });
                currentMessage.subject = subject;
              }
              
              if (dateMatch) {
                try {
                  const parsedDate = new Date(dateMatch[1].trim());
                  if (!isNaN(parsedDate.getTime())) {
                    currentMessage.received_at = parsedDate.toISOString();
                  }
                } catch (e) {}
              }
              
              inHeaders = false;
            }
          }
        }
        
        if (currentMessage && currentMessage.message_id && currentMessage.from_email) {
          emails.push(currentMessage);
        }
        
        return emails;
      };

      // Fonction pour synchroniser un dossier
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

          const startMsg = Math.max(1, totalMessages - 49);
          const endMsg = totalMessages;
          
          console.log(`🔍 Fetching messages ${startMsg}:${endMsg} from ${folderName}`);

          response = await sendCommand(`FETCH ${startMsg}:${endMsg} (FLAGS ENVELOPE BODY.PEEK[HEADER])`);
          
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

      // Synchroniser le dossier Envoyés
      console.log('📤 Synchronisation dossier Envoyés...');
      const sentFolderNames = [
        '[Gmail]/Sent Mail',
        '[Gmail]/Messages envoy&AOk-s',
        'Sent',
        'Sent Items',
        'Sent Messages',
        'INBOX.Sent',
        'Envoy&AOk-s',
        'Messages envoy&AOk-s'
      ];
      
      let sentEmails: any[] = [];
      for (const folderName of sentFolderNames) {
        const sentResult = await syncFolder(folderName);
        if (sentResult.emails.length > 0) {
          sentEmails = sentResult.emails;
          console.log(`✅ Found sent emails in folder: ${folderName}`);
          break;
        }
      }

      // Sauvegarder les emails reçus dans inbound_emails
      let syncedInbox = 0;
      for (const email of inboxEmails) {
        try {
          const { data: existing } = await supabase
            .from('inbound_emails')
            .select('id')
            .eq('message_id', email.message_id)
            .eq('user_id', userId)
            .single();
          
          if (!existing) {
            const { error: insertError } = await supabase
              .from('inbound_emails')
              .insert(email);
            
            if (!insertError) {
              syncedInbox++;
              
              try {
                await supabase
                  .from('email_notifications')
                  .insert({
                    user_id: userId,
                    type: 'new_email',
                    title: 'Nouveau message',
                    message: `De: ${email.from_name || email.from_email}\nSujet: ${email.subject}`,
                    is_read: false
                  });
              } catch (notifError) {
                console.error('⚠️ Erreur création notification:', notifError);
              }
            }
          }
        } catch (error) {
          console.error('❌ Erreur traitement email INBOX:', error);
        }
      }

      // Sauvegarder les emails envoyés dans emails table
      let syncedSent = 0;
      for (const email of sentEmails) {
        try {
          // Vérifier si l'email existe déjà
          const { data: existing } = await supabase
            .from('emails')
            .select('id')
            .eq('message_id', email.message_id)
            .eq('user_id', userId)
            .single();
          
          if (!existing) {
            // Trouver le contact correspondant au destinataire
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