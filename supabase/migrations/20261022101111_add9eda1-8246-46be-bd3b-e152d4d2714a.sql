CREATE OR REPLACE FUNCTION public._fx_qp_decode(t text, cs text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  s text;
  b bytea;
BEGIN
  IF t IS NULL OR t = '' THEN RETURN t; END IF;
  s := regexp_replace(t, '=\r?\n', '', 'g');
  SELECT string_agg(
           CASE WHEN m[1] IS NOT NULL THEN decode(substr(m[1], 2), 'hex')
                ELSE convert_to(coalesce(m[2], m[3]), 'UTF8') END,
           ''::bytea ORDER BY ord)
    INTO b
    FROM regexp_matches(s, '(=[0-9A-Fa-f]{2})|([^=]+)|(=)', 'g') WITH ORDINALITY AS r(m, ord);
  IF b IS NULL THEN RETURN t; END IF;
  BEGIN
    RETURN convert_from(b, cs);
  EXCEPTION WHEN others THEN
    BEGIN
      RETURN convert_from(b, 'WIN1252');
    EXCEPTION WHEN others THEN
      RETURN t;
    END;
  END;
END $$;

CREATE OR REPLACE FUNCTION public._fx_pg_charset(html text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE c text;
BEGIN
  c := lower(substring(regexp_replace(coalesce(html, ''), '=\r?\n', '', 'g') from 'charset=(?:3D)?"?([A-Za-z0-9_-]+)'));
  RETURN CASE
    WHEN c IS NULL THEN 'UTF8'
    WHEN c IN ('utf-8', 'utf8') THEN 'UTF8'
    WHEN c IN ('windows-1252', 'cp1252', 'win1252') THEN 'WIN1252'
    WHEN c = 'windows-1258' THEN 'WIN1258'
    WHEN c = 'windows-1250' THEN 'WIN1250'
    WHEN c IN ('iso-8859-1', 'latin1', 'us-ascii') THEN 'LATIN1'
    WHEN c = 'iso-8859-15' THEN 'LATIN9'
    ELSE 'WIN1252'
  END;
END $$;

ALTER TABLE public.emails DISABLE TRIGGER update_emails_updated_at;

WITH bad AS (
  SELECT id, content, html_content,
         public._fx_pg_charset(html_content) AS cs,
         (html_content ~ '=3D' OR html_content ~ '=[0-9A-F]{2}[a-z ]') AS html_bad
  FROM public.emails
  WHERE provider = 'imap'
    AND (html_content ~ '=3D' OR content ~ '=(E[0-9A-F]|C[0-9A-F]|9[0-9A-F]|A0|20)')
), fixed AS (
  SELECT id, cs, html_bad, content,
         CASE WHEN html_bad THEN public._fx_qp_decode(html_content, cs) ELSE html_content END AS new_html
  FROM bad
)
UPDATE public.emails e
SET html_content = f.new_html,
    content = CASE
      WHEN f.html_bad AND position(E'\n' in coalesce(f.content, '')) = 0 THEN
        btrim(regexp_replace(
          regexp_replace(
            regexp_replace(f.new_html, '<style[^>]*>.*?</style>', ' ', 'gis'),
          '<[^>]*>', ' ', 'g'),
        '\s+', ' ', 'g'))
      ELSE public._fx_qp_decode(f.content, f.cs)
    END
FROM fixed f
WHERE e.id = f.id;

ALTER TABLE public.emails ENABLE TRIGGER update_emails_updated_at;

DROP FUNCTION public._fx_qp_decode(text, text);
DROP FUNCTION public._fx_pg_charset(text);