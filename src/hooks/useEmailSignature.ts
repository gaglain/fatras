import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const hasImage = (html: string) => /<img\b/i.test(html);
const escapeAttribute = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const addAvatarToEmailSignature = (signature: string, avatarUrl?: string | null) => {
  const trimmedSignature = signature.trim();
  if (!avatarUrl || hasImage(trimmedSignature)) return trimmedSignature;
  const safeAvatarUrl = escapeAttribute(avatarUrl);

  return `<div style="display:flex;align-items:flex-start;gap:14px;">
    <img src="${safeAvatarUrl}" alt="Photo de profil" width="72" height="72" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block;" />
    <div>${trimmedSignature}</div>
  </div>`;
};

export const useEmailSignature = () => {
  const { user } = useAuth();
  const [signatureHtml, setSignatureHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSignature = async () => {
      if (!user?.id) {
        if (active) {
          setSignatureHtml('');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('user_profiles')
        .select('email_signature, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (active) {
        setSignatureHtml(addAvatarToEmailSignature(data?.email_signature || '', data?.avatar_url));
        setLoading(false);
      }
    };

    loadSignature();
    return () => {
      active = false;
    };
  }, [user?.id]);

  return { signatureHtml, loading };
};