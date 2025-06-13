
import jsPDF from 'jspdf';
import { TourStop } from '@/types/roadshow.types';

export const generateTourStopPDF = (tourStop: TourStop, getUserById: (userId: string) => { name: string } | undefined) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FEUILLE DE ROUTE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Event details section
  checkNewPage(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DE L\'ÉVÉNEMENT', margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const eventDetails = [
    ['Ville:', tourStop.city || 'Non spécifié'],
    ['Lieu:', tourStop.venue || 'Non spécifié'],
    ['Adresse:', tourStop.address || 'Non spécifiée'],
    ['Date:', tourStop.date ? new Date(tourStop.date).toLocaleDateString('fr-FR') : 'Non spécifiée'],
    ['Heure:', tourStop.time || 'Non spécifiée'],
    ['Capacité:', tourStop.capacity ? tourStop.capacity.toString() : 'Non spécifiée'],
    ['Billets disponibles:', tourStop.ticketsAvailable ? tourStop.ticketsAvailable.toString() : 'Non spécifié'],
    ['Statut:', tourStop.status === 'confirmed' ? 'Confirmé' : tourStop.status === 'pending' ? 'En attente' : 'Annulé']
  ];

  eventDetails.forEach(([label, value]) => {
    checkNewPage(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(value, margin + 40, yPosition, pageWidth - margin - 60);
    yPosition += 2;
  });

  yPosition += 10;

  // Artist lineup section
  if (tourStop.artistLineup && tourStop.artistLineup.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LINEUP ARTISTES', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    tourStop.artistLineup.forEach((artist) => {
      checkNewPage(8);
      const user = getUserById(artist.userId);
      const artistName = user?.name || `Artiste ${artist.userId}`;
      const status = artist.confirmed ? '✓ Confirmé' : '⚠ En attente';
      
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${artistName}`, margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(status, margin + 80, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Logistics section
  checkNewPage(50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGISTIQUE', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const logisticsDetails = [
    ['Check-in:', tourStop.checkInTime || 'Non spécifié'],
    ['Départ prévu:', tourStop.departureTime || 'Non spécifié'],
    ['Transport:', tourStop.transport || 'Non spécifié'],
    ['Logement:', tourStop.accommodation || 'Non spécifié'],
    ['Adresse logement:', tourStop.accommodationAddress || 'Non spécifiée']
  ];

  logisticsDetails.forEach(([label, value]) => {
    checkNewPage(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(value, margin + 50, yPosition, pageWidth - margin - 70);
    yPosition += 2;
  });

  yPosition += 10;

  // Equipment section
  if (tourStop.equipment && tourStop.equipment.length > 0 && tourStop.equipment[0]) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉQUIPEMENT', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tourStop.equipment.forEach((item) => {
      if (item.trim()) {
        checkNewPage(6);
        doc.text(`• ${item.trim()}`, margin, yPosition);
        yPosition += 6;
      }
    });
    yPosition += 10;
  }

  // Crew section
  if (tourStop.crew && tourStop.crew.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉQUIPE TECHNIQUE', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tourStop.crew.forEach((crewId) => {
      checkNewPage(6);
      const user = getUserById(crewId);
      const crewName = user?.name || `Membre ${crewId}`;
      doc.text(`• ${crewName}`, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Contact section
  checkNewPage(20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT SUR PLACE', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const contactDetails = [
    ['Contact:', tourStop.localContact || 'Non spécifié'],
    ['Téléphone:', tourStop.localContactPhone || 'Non spécifié']
  ];

  contactDetails.forEach(([label, value]) => {
    checkNewPage(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(value, margin + 30, yPosition, pageWidth - margin - 50);
    yPosition += 2;
  });

  // Notes section
  if (tourStop.notes && tourStop.notes.trim()) {
    yPosition += 10;
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(tourStop.notes, margin, yPosition, pageWidth - 2 * margin);
  }

  // Footer with generation date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`feuille-de-route-${tourStop.city}-${tourStop.date}.pdf`);

  return doc;
};
