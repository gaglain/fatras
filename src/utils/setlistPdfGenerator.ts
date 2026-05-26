import jsPDF from 'jspdf';
import { SongPdfData } from './songPdfGenerator';

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

export interface SetlistPdfOptions {
  includeNotes?: boolean;
  includeLyrics?: boolean;
}

const calcDuration = (songs: SongPdfData[]): string => {
  let total = 0;
  songs.forEach((s) => {
    if (!s.duration) return;
    const parts = s.duration.split(':').map((p) => parseInt(p) || 0);
    if (parts.length === 2) total += parts[0] * 60 + parts[1];
    else if (parts.length === 3) total += parts[0] * 3600 + parts[1] * 60 + parts[2];
  });
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
};

export const generateSetlistPDF = (
  setlist: { title: string; description?: string; sacem_program_number?: string; artistName?: string },
  songs: SongPdfData[],
  options: SetlistPdfOptions = {}
) => {
  const { includeNotes = false, includeLyrics = false } = options;
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

  // Header
  setFill(COLORS.bg);
  doc.rect(0, 0, pw, 50, 'F');
  setFill(COLORS.primary);
  doc.rect(0, 0, pw, 3, 'F');

  y = 16;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.muted);
  doc.text('SETLIST'.toUpperCase() + (setlist.artistName ? `  ·  ${setlist.artistName.toUpperCase()}` : ''), m, y);
  y += 7;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.text);
  doc.text(doc.splitTextToSize(setlist.title || 'Setlist', contentW), m, y);
  y = 50;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.muted);
  const headerMeta: string[] = [`${songs.length} chanson(s)`];
  const dur = calcDuration(songs);
  if (dur && dur !== '0:00') headerMeta.push(`Durée : ${dur}`);
  if (setlist.sacem_program_number) headerMeta.push(`SACEM : ${setlist.sacem_program_number}`);
  doc.text(headerMeta.join('   •   '), m, y);
  y += 6;

  if (setlist.description) {
    doc.setFontSize(9);
    setColor(COLORS.text);
    const desc = doc.splitTextToSize(setlist.description, contentW);
    doc.text(desc, m, y);
    y += desc.length * 4.5 + 2;
  }

  setDraw(COLORS.border);
  doc.setLineWidth(0.4);
  doc.line(m, y, pw - m, y);
  y += 8;

  // Track listing
  songs.forEach((song, idx) => {
    checkPage(14);

    // Title row
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.text);
    const num = `${(idx + 1).toString().padStart(2, '0')}.`;
    doc.text(num, m, y);
    const titleText = song.title || 'Sans titre';
    const titleLines = doc.splitTextToSize(titleText, contentW - 14);
    doc.text(titleLines, m + 10, y);
    const titleHeight = titleLines.length * 5.5;

    // Meta on right
    const meta: string[] = [];
    if (song.duration) meta.push(song.duration);
    if (song.tonality) meta.push(song.tonality);
    if (song.bpm) meta.push(`${song.bpm} BPM`);
    if (meta.length) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.muted);
      doc.text(meta.join('  ·  '), pw - m, y, { align: 'right' });
    }
    y += titleHeight + 1;

    if (song.sacem_number) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      setColor(COLORS.muted);
      doc.text(`SACEM : ${song.sacem_number}`, m + 10, y);
      y += 4;
    }

    if (includeNotes) {
      const t = htmlToText(song.notes);
      if (t) {
        y += 1;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        setColor(COLORS.primary);
        checkPage(8);
        doc.text('NOTES', m + 10, y);
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.text);
        doc.splitTextToSize(t, contentW - 10).forEach((ln: string) => {
          checkPage(5);
          doc.text(ln, m + 10, y);
          y += 4.5;
        });
      }
    }

    if (includeLyrics) {
      const t = htmlToText(song.lyrics);
      if (t) {
        y += 1;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        setColor(COLORS.primary);
        checkPage(8);
        doc.text('PAROLES', m + 10, y);
        y += 4;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.text);
        doc.splitTextToSize(t, contentW - 10).forEach((ln: string) => {
          checkPage(5);
          doc.text(ln, m + 10, y);
          y += 5;
        });
      }
    }

    y += 4;
    setDraw(COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(m, y, pw - m, y);
    y += 4;
  });

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

  const safe = (setlist.title || 'setlist').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  doc.save(`${safe}.pdf`);
};
