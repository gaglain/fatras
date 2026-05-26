import jsPDF from 'jspdf';

export interface SongPdfData {
  title: string;
  duration?: string;
  tonality?: string;
  bpm?: number;
  notes?: string;
  lyrics?: string;
  sacem_number?: string;
}

const COLORS = {
  primary: [196, 101, 74] as const,
  text: [30, 30, 30] as const,
  muted: [120, 113, 108] as const,
  border: [214, 211, 209] as const,
  bg: [245, 243, 238] as const,
};

const htmlToText = (html?: string): string => {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const generateSongPDF = (song: SongPdfData, setlistTitle?: string) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const m = 18;
  const contentW = pw - 2 * m;
  let y = m;

  const setColor = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

  const checkPage = (need: number) => {
    if (y + need > ph - 18) {
      doc.addPage();
      y = m;
    }
  };

  // Header band
  setFill(COLORS.bg);
  doc.rect(0, 0, pw, 42, 'F');
  setFill(COLORS.primary);
  doc.rect(0, 0, pw, 3, 'F');

  y = 16;
  if (setlistTitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.muted);
    doc.text(setlistTitle.toUpperCase(), m, y);
    y += 6;
  }
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.text);
  const titleLines = doc.splitTextToSize(song.title || 'Sans titre', contentW);
  doc.text(titleLines, m, y);
  y = 46;

  // Meta line
  const meta: string[] = [];
  if (song.duration) meta.push(`Durée : ${song.duration}`);
  if (song.tonality) meta.push(`Tonalité : ${song.tonality}`);
  if (song.bpm) meta.push(`${song.bpm} BPM`);
  if (song.sacem_number) meta.push(`SACEM : ${song.sacem_number}`);
  if (meta.length) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.muted);
    doc.text(meta.join('   •   '), m, y);
    y += 6;
  }

  setDraw(COLORS.border);
  doc.setLineWidth(0.4);
  doc.line(m, y, pw - m, y);
  y += 8;

  // Notes
  const notesText = htmlToText(song.notes);
  if (notesText) {
    checkPage(14);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.primary);
    doc.text('NOTES', m, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.text);
    const noteLines = doc.splitTextToSize(notesText, contentW);
    noteLines.forEach((ln: string) => {
      checkPage(6);
      doc.text(ln, m, y);
      y += 5;
    });
    y += 4;
  }

  // Lyrics
  const lyricsText = htmlToText(song.lyrics);
  if (lyricsText) {
    checkPage(14);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.primary);
    doc.text('PAROLES', m, y);
    y += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.text);
    const lyricsLines = doc.splitTextToSize(lyricsText, contentW);
    lyricsLines.forEach((ln: string) => {
      checkPage(6);
      doc.text(ln, m, y);
      y += 5.5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.muted);
    doc.text(
      `Fatras — ${new Date().toLocaleDateString('fr-FR')}   ·   Page ${i}/${pageCount}`,
      pw / 2,
      ph - 8,
      { align: 'center' }
    );
  }

  const safe = (song.title || 'chanson').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  doc.save(`${safe}.pdf`);
};
