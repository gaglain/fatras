import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ExpenseFileLinkProps {
  fileUrl: string;
  className?: string;
  children: React.ReactNode;
}

const getPath = (fileUrl: string): string | null => {
  if (!fileUrl) return null;
  if (fileUrl.includes('/roadshow-expenses/')) {
    return fileUrl.split('/roadshow-expenses/')[1] || null;
  }
  return fileUrl;
};

/**
 * Anchor that resolves a fresh signed URL on click for the private
 * `roadshow-expenses` bucket. Falls back to the raw stored URL on error.
 */
export const ExpenseFileLink: React.FC<ExpenseFileLinkProps> = ({ fileUrl, className, children }) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const path = getPath(fileUrl);
    if (!path) return;
    try {
      const { data, error } = await supabase.storage
        .from('roadshow-expenses')
        .createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error;
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      logger.error('Error creating signed URL:', err);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a href={fileUrl} onClick={handleClick} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
};

interface ExpenseImageProps {
  fileUrl: string;
  alt: string;
  className?: string;
}

/**
 * Image component that resolves a signed URL for the private bucket.
 */
export const ExpenseImage: React.FC<ExpenseImageProps> = ({ fileUrl, alt, className }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const path = getPath(fileUrl);
      if (!path) return;
      try {
        const { data, error } = await supabase.storage
          .from('roadshow-expenses')
          .createSignedUrl(path, 3600);
        if (!cancelled && !error && data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        logger.error('Error creating signed URL for image:', err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return <img src={signedUrl || ''} alt={alt} className={className} />;
};
