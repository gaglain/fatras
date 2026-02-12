
import jsPDF from 'jspdf';
import { TourStop } from '@/types/roadshow.types';

interface TourStopWithCosts extends TourStop {
  vehicleType?: string;
  distanceKm?: number;
  travelCost?: number;
  co2Emission?: number;
}

// Design tokens (RGB)
const COLORS = {
  primary: [180, 83, 9] as const,
  primaryLight: [251, 243, 230] as const,
  text: [30, 30, 30] as const,
  muted: [120, 113, 108] as const,
  success: [22, 163, 74] as const,
  warning: [202, 138, 4] as const,
  danger: [220, 38, 38] as const,
  white: [255, 255, 255] as const,
  border: [214, 211, 209] as const,
  sectionBg: [245, 241, 237] as const,
};

export const generateTourStopPDF = (
  tourStop: TourStopWithCosts,
  getUserById: (userId: string) => { name: string } | undefined
) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const m = 16;
  const contentW = pw - 2 * m;
  let y = m;

  const setColor = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

  const checkPage = (need: number) => {
    if (y + need > ph - 20) {
      doc.addPage();
      y = m;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPage(16);
    setFill(COLORS.primary);
    doc.roundedRect(m, y - 1, contentW, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(title, m + 4, y + 6);
    setColor(COLORS.text);
    y += 14;
  };

  const drawField = (label: string, value: string, labelWidth = 45) => {
    if (!value) return;
    checkPage(7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.muted);
    doc.text(label, m + 4, y);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.text);
    const lines = doc.splitTextToSize(value, contentW - labelWidth - 8);
    doc.text(lines, m + labelWidth, y);
    y += lines.length * 4.5 + 2;
  };

  const drawBadge = (text: string, color: readonly number[], x: number, yPos: number): number => {
    doc.setFontSize(8);
    const tw = doc.getTextWidth(text) + 8;
    setFill(color);
    doc.roundedRect(x, yPos - 4, tw, 7, 1.5, 1.5, 'F');
    setColor(COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x + 4, yPos);
    setColor(COLORS.text);
    return tw + 3;
  };

  const drawBadgeOutline = (text: string, x: number, yPos: number): number => {
    doc.setFontSize(8);
    const tw = doc.getTextWidth(text) + 8;
    setDraw(COLORS.border);
    setFill(COLORS.white);
    doc.roundedRect(x, yPos - 4, tw, 7, 1.5, 1.5, 'FD');
    setColor(COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x + 4, yPos);
    return tw + 3;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'CONFIRME', color: COLORS.success };
      case 'pending': return { label: 'EN ATTENTE', color: COLORS.warning };
      case 'cancelled': return { label: 'ANNULE', color: COLORS.danger };
      default: return { label: status.toUpperCase(), color: COLORS.muted };
    }
  };

  // ==========================================
  // HEADER
  // ==========================================
  setFill(COLORS.primaryLight);
  doc.rect(0, 0, pw, 50, 'F');
  setFill(COLORS.primary);
  doc.rect(0, 0, pw, 4, 'F');

  y = 18;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.primary);
  doc.text('FEUILLE DE ROUTE', m, y);

  y += 10;
  doc.setFontSize(16);
  setColor(COLORS.text);
  const cityVenue = [tourStop.city, tourStop.venue].filter(Boolean).join(' - ');
  doc.text(cityVenue || '—', m, y);

  // Status badge
  const statusInfo = getStatusInfo(tourStop.status);
  y += 8;
  drawBadge(statusInfo.label, statusInfo.color, m, y);

  // Date on right
  if (tourStop.date) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.primary);
    const dateStr = new Date(tourStop.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    doc.text(dateStr, pw - m, 28, { align: 'right' });
    if (tourStop.time) {
      doc.setFontSize(10);
      setColor(COLORS.muted);
      doc.text(tourStop.time, pw - m, 35, { align: 'right' });
    }
  }

  y = 54;
  setDraw(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(m, y, pw - m, y);
  y += 8;

  // ==========================================
  // EVENEMENT
  // ==========================================
  drawSectionHeader("DETAILS DE L'EVENEMENT");

  drawField('Adresse :', tourStop.address || '');
  drawField('Capacite :', tourStop.capacity ? `${tourStop.capacity} places` : '');
  drawField('Billets dispo. :', tourStop.ticketsAvailable ? `${tourStop.ticketsAvailable}` : '');
  y += 4;

  // ==========================================
  // HORAIRES
  // ==========================================
  const timeSlots = [
    { label: 'Arrivee', value: tourStop.checkInTime },
    { label: 'Balance', value: tourStop.soundcheckTime },
    { label: 'Ouverture portes', value: tourStop.doorsTime },
    { label: 'Debut show', value: tourStop.showStartTime },
    { label: 'Fin show', value: tourStop.showEndTime },
    { label: 'Couvre-feu', value: tourStop.curfewTime },
    { label: 'Depart', value: tourStop.departureTime },
  ].filter(t => t.value);

  if (timeSlots.length > 0) {
    drawSectionHeader('HORAIRES');

    checkPage(timeSlots.length * 8 + 4);
    setFill(COLORS.sectionBg);
    doc.roundedRect(m, y - 2, contentW, timeSlots.length * 8 + 4, 3, 3, 'F');

    timeSlots.forEach((slot, i) => {
      const slotY = y + i * 8 + 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.muted);
      doc.text(slot.label, m + 6, slotY);
      doc.setFont('helvetica', 'bold');
      setColor(COLORS.text);
      doc.text(slot.value!, m + 55, slotY);
    });
    y += timeSlots.length * 8 + 8;
  }

  // ==========================================
  // CASTING
  // ==========================================
  if (tourStop.artistLineup && tourStop.artistLineup.length > 0) {
    drawSectionHeader('CASTING');

    let badgeX = m + 4;
    tourStop.artistLineup.forEach((artist) => {
      const user = getUserById(artist.userId);
      const name = user?.name || `Artiste`;
      const label = artist.confirmed ? `${name} (conf.)` : `${name} (att.)`;
      const color = artist.confirmed ? COLORS.success : COLORS.warning;

      doc.setFontSize(8);
      const bw = doc.getTextWidth(label) + 10;
      if (badgeX + bw > pw - m) {
        badgeX = m + 4;
        y += 9;
        checkPage(10);
      }
      drawBadge(label, color, badgeX, y);
      badgeX += bw + 3;
    });
    y += 10;
  }

  // ==========================================
  // EQUIPE TECHNIQUE
  // ==========================================
  if (tourStop.crew && tourStop.crew.length > 0) {
    drawSectionHeader('EQUIPE TECHNIQUE');

    let badgeX = m + 4;
    tourStop.crew.forEach((crewId) => {
      const user = getUserById(crewId);
      const name = user?.name || 'Inconnu';

      doc.setFontSize(8);
      const bw = doc.getTextWidth(name) + 10;
      if (badgeX + bw > pw - m) {
        badgeX = m + 4;
        y += 9;
        checkPage(10);
      }
      drawBadgeOutline(name, badgeX, y);
      badgeX += bw + 3;
    });
    y += 10;
  }

  // ==========================================
  // LOGISTIQUE
  // ==========================================
  drawSectionHeader('LOGISTIQUE');

  drawField('Transport :', tourStop.transport || '');
  drawField('Hebergement :', tourStop.accommodation || '');
  drawField('Adr. heberg. :', tourStop.accommodationAddress || '');

  if (tourStop.vehicleType || tourStop.distanceKm) {
    let travelInfo = '';
    if (tourStop.vehicleType) travelInfo += tourStop.vehicleType;
    if (tourStop.distanceKm) travelInfo += ` - ${tourStop.distanceKm} km`;
    if (tourStop.travelCost) travelInfo += ` - ${tourStop.travelCost.toFixed(2)} EUR`;
    drawField('Vehicule :', travelInfo);
  }

  if (tourStop.co2Emission && tourStop.co2Emission > 0) {
    const co2Text = tourStop.co2Emission < 1
      ? `${(tourStop.co2Emission * 1000).toFixed(0)}g CO2`
      : `${tourStop.co2Emission.toFixed(1)}kg CO2`;
    drawField('Empreinte :', co2Text);
  }
  y += 4;

  // ==========================================
  // EQUIPEMENT
  // ==========================================
  if (tourStop.equipment && tourStop.equipment.length > 0 && tourStop.equipment.some(e => e.trim())) {
    drawSectionHeader('EQUIPEMENT');

    let badgeX = m + 4;
    tourStop.equipment.forEach((item) => {
      if (!item.trim()) return;
      doc.setFontSize(8);
      const bw = doc.getTextWidth(item.trim()) + 10;
      if (badgeX + bw > pw - m) {
        badgeX = m + 4;
        y += 9;
        checkPage(10);
      }
      drawBadgeOutline(item.trim(), badgeX, y);
      badgeX += bw + 3;
    });
    y += 10;
  }

  // ==========================================
  // CONTACT SUR PLACE
  // ==========================================
  if (tourStop.localContact || tourStop.localContactPhone) {
    drawSectionHeader('CONTACT SUR PLACE');
    drawField('Nom :', tourStop.localContact || '');
    drawField('Telephone :', tourStop.localContactPhone || '');
    y += 4;
  }

  // ==========================================
  // INVITATIONS
  // ==========================================
  if (tourStop.invitations && tourStop.invitations.trim()) {
    drawSectionHeader('INVITATIONS');
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.text);
    const lines = doc.splitTextToSize(tourStop.invitations, contentW - 8);
    doc.text(lines, m + 4, y);
    y += lines.length * 4.5 + 6;
  }

  // ==========================================
  // NOTES
  // ==========================================
  if (tourStop.notes && tourStop.notes.trim()) {
    drawSectionHeader('NOTES');
    checkPage(10);
    setFill(COLORS.sectionBg);
    const noteLines = doc.splitTextToSize(tourStop.notes, contentW - 12);
    const noteH = noteLines.length * 4.5 + 6;
    doc.roundedRect(m, y - 2, contentW, noteH, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.text);
    doc.text(noteLines, m + 6, y + 3);
    y += noteH + 4;
  }

  // ==========================================
  // FOOTER
  // ==========================================
  const footerY = ph - 12;
  setDraw(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(m, footerY - 4, pw - m, footerY - 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.muted);
  doc.text(
    `Document genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`,
    pw / 2,
    footerY,
    { align: 'center' }
  );

  const safeName = (tourStop.city || 'etape').replace(/\s+/g, '-').toLowerCase();
  doc.save(`feuille-de-route-${safeName}-${tourStop.date || 'sans-date'}.pdf`);
  return doc;
};
