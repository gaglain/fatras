// Decode MIME encoded-word headers like
// =?Windows-1252?Q?Teaser_Fatras_=95_A_l'=E9preuve_des_Pav=E9s_!?=
// or =?UTF-8?B?...base64...?=
// Falls back to the original string if decoding fails.

const decodeQuotedPrintable = (input: string, charset: string): string => {
  // In Q encoding, '_' represents a space
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '_') {
      bytes.push(0x20);
    } else if (ch === '=' && i + 2 < input.length) {
      const hex = input.substr(i + 1, 2);
      const code = parseInt(hex, 16);
      if (!Number.isNaN(code)) {
        bytes.push(code);
        i += 2;
      } else {
        bytes.push(ch.charCodeAt(0));
      }
    } else {
      bytes.push(ch.charCodeAt(0));
    }
  }
  try {
    const decoder = new TextDecoder(charset);
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    return String.fromCharCode(...bytes);
  }
};

const decodeBase64 = (input: string, charset: string): string => {
  try {
    const bin = atob(input.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      return new TextDecoder('utf-8').decode(bytes);
    }
  } catch {
    return input;
  }
};

export const decodeMimeHeader = (raw?: string | null): string => {
  if (!raw) return '';
  const re = /=\?([^?]+)\?([QqBb])\?([^?]*)\?=/g;
  // Handle adjacent encoded-words (RFC 2047): whitespace between two
  // encoded-words must be removed before concatenation.
  const cleaned = raw.replace(/\?=\s+=\?/g, '?==?');
  return cleaned.replace(re, (_, charset: string, enc: string, payload: string) => {
    const cs = (charset || 'utf-8').toLowerCase();
    if (enc.toUpperCase() === 'B') return decodeBase64(payload, cs);
    return decodeQuotedPrintable(payload, cs);
  });
};

// Build a normalized "thread key" from a subject line by stripping
// reply/forward prefixes (Re:, Fwd:, Tr:, etc.) and collapsing whitespace.
export const normalizeSubject = (subject?: string | null): string => {
  if (!subject) return '';
  let s = decodeMimeHeader(subject).trim();
  // Strip leading prefixes repeatedly
  // Matches: Re:, RE:, R:, Fwd:, Fw:, Tr:, FW:, possibly with [n]
  const prefixRe = /^(re|ref|aw|antw|r|fwd|fw|tr|tr\.?|fyi)(\s*\[\d+\])?\s*:\s*/i;
  let prev = '';
  while (s !== prev) {
    prev = s;
    s = s.replace(prefixRe, '');
  }
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
};
