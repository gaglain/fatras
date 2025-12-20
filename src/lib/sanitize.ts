import DOMPurify from 'dompurify';

// List of safe CSS properties that don't enable UI redressing attacks
const SAFE_CSS_PROPERTIES = [
  'color', 'background-color', 'background', 
  'font-size', 'font-weight', 'font-style', 'font-family',
  'text-align', 'text-decoration', 'line-height', 'letter-spacing',
  'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
  'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  'border', 'border-color', 'border-width', 'border-style', 'border-radius',
  'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
  'list-style', 'list-style-type',
  'vertical-align', 'white-space', 'word-wrap', 'word-break'
];

// Dangerous CSS properties that can enable clickjacking/UI redressing
// position, z-index, opacity, display, visibility, transform, etc. are NOT allowed

/**
 * Filter CSS style string to only allow safe properties
 */
const filterCssProperties = (styleValue: string): string => {
  if (!styleValue) return '';
  
  const styles = styleValue.split(';');
  const safeStyles = styles.filter(style => {
    const prop = style.split(':')[0]?.trim().toLowerCase();
    return prop && SAFE_CSS_PROPERTIES.includes(prop);
  });
  
  return safeStyles.join(';');
};

// Configure DOMPurify hook to filter dangerous CSS properties
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style' && data.attrValue) {
    data.attrValue = filterCssProperties(data.attrValue);
  }
});

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with a safe configuration
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
};

/**
 * Sanitize HTML for email display - more permissive for email rendering
 * but still filters dangerous CSS properties
 */
export const sanitizeEmailHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'pre', 'code',
      'center', 'font', 'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan', 'align', 'valign', 'bgcolor',
      'border', 'cellpadding', 'cellspacing', 'color', 'face', 'size'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'form', 'input', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
};
