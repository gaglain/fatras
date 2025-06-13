import jsPDF from 'jspdf';
import { TourStop } from '@/types/roadshow.types';

export const generateTourStopPDF = async (stop: TourStop, getUserById: (userId: string) => { name: string } | undefined) => {
  const doc = new jsPDF();
  
  // Configuration de base
  doc.setFont('helvetica');
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  
  // Récupérer les paramètres de l'entreprise
  const companySettings = JSON.parse(localStorage.getItem('companySettings') || '{"name":"Fatras Booking","logo":"","favicon":""}');
  
  // Ajouter le logo si disponible
  if (companySettings.logo) {
    try {
      // Créer une image pour obtenir les dimensions
      const img = new Image();
      img.src = companySettings.logo;
      
      // Attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Calculer les dimensions pour que le logo fasse maximum 30mm de haut
      const maxHeight = 30;
      const maxWidth = 40;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const logoWidth = img.width * ratio;
      const logoHeight = img.height * ratio;
      
      // Ajouter le logo en haut à droite
      doc.addImage(companySettings.logo, 'JPEG', pageWidth - logoWidth - 20, 10, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Impossible de charger le logo dans le PDF:', error);
    }
  }
  
  // Titre principal avec le nom de l'entreprise
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text(companySettings.name || 'FATRAS BOOKING', 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(16);
  doc.setTextColor(102, 102, 102);
  doc.text('FEUILLE DE ROUTE', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(18);
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'bold');
  doc.text(`${stop.city} - ${stop.venue}`, 20, yPosition);
  
  // Ligne de séparation colorée
  yPosition += 10;
  doc.setLineWidth(2);
  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  
  // Section LIEU ET HORAIRES avec fond coloré
  doc.setFillColor(249, 250, 251);
  doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('📍 LIEU ET HORAIRES', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Lieu: ${stop.venue}`, 25, yPosition);
  yPosition += 6;
  doc.text(`Adresse: ${stop.address}`, 25, yPosition);
  yPosition += 6;
  doc.text(`Date: ${new Date(stop.date).toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 25, yPosition);
  yPosition += 6;
  doc.text(`Heure spectacle: ${stop.time}`, 25, yPosition);
  yPosition += 6;
  
  if (stop.checkInTime) {
    doc.text(`Arrivée équipe: ${stop.checkInTime}`, 25, yPosition);
    yPosition += 6;
  }
  if (stop.departureTime) {
    doc.text(`Départ: ${stop.departureTime}`, 25, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Section CASTING
  doc.setFillColor(254, 243, 199);
  doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('🎭 CASTING', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  
  if (stop.artistLineup.length > 0) {
    stop.artistLineup.forEach(artist => {
      const user = getUserById(artist.userId);
      const status = artist.confirmed ? '✅ Confirmé' : '⏳ En attente';
      doc.text(`• ${user?.name || 'Artiste inconnu'} - ${status}`, 25, yPosition);
      yPosition += 6;
    });
  } else {
    doc.text('• Aucun artiste assigné', 25, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Section CAPACITÉ
  doc.setFillColor(219, 234, 254);
  doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('👥 CAPACITÉ', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Capacité totale: ${stop.capacity} personnes`, 25, yPosition);
  yPosition += 6;
  if (stop.ticketsAvailable) {
    doc.text(`Billets disponibles: ${stop.ticketsAvailable}`, 25, yPosition);
    yPosition += 6;
  }
  
  // Contact local
  if (stop.localContact) {
    yPosition += 10;
    doc.setFillColor(240, 253, 244);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('📞 CONTACT LOCAL', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Contact: ${stop.localContact}`, 25, yPosition);
    yPosition += 6;
    if (stop.localContactPhone) {
      doc.text(`Téléphone: ${stop.localContactPhone}`, 25, yPosition);
      yPosition += 6;
    }
  }
  
  // Hébergement
  if (stop.accommodation) {
    yPosition += 10;
    doc.setFillColor(252, 231, 243);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(157, 23, 77);
    doc.text('🏨 HÉBERGEMENT', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Hébergement: ${stop.accommodation}`, 25, yPosition);
    yPosition += 6;
    if (stop.accommodationAddress) {
      doc.text(`Adresse: ${stop.accommodationAddress}`, 25, yPosition);
      yPosition += 6;
    }
  }
  
  // Transport
  if (stop.transport) {
    yPosition += 10;
    doc.setFillColor(233, 213, 255);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text('🚐 TRANSPORT', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Transport: ${stop.transport}`, 25, yPosition);
    yPosition += 6;
  }
  
  // Notes
  if (stop.notes) {
    yPosition += 10;
    doc.setFillColor(254, 242, 242);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('📝 NOTES IMPORTANTES', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    // Diviser les notes en lignes
    const noteLines = doc.splitTextToSize(stop.notes, pageWidth - 50);
    noteLines.forEach((line: string) => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
  }
  
  // Statut en bas avec couleur selon le statut
  yPosition = doc.internal.pageSize.getHeight() - 40;
  
  // Fond coloré selon le statut
  let statusColor, statusBg, statusText;
  const statusValue = stop.status || 'unknown';
  
  switch (statusValue) {
    case 'confirmed':
      statusColor = [22, 163, 74];
      statusBg = [240, 253, 244];
      statusText = '✅ CONFIRMÉ';
      break;
    case 'pending':
      statusColor = [245, 158, 11];
      statusBg = [254, 243, 199];
      statusText = '⏳ EN ATTENTE';
      break;
    case 'cancelled':
      statusColor = [220, 38, 38];
      statusBg = [254, 242, 242];
      statusText = '❌ ANNULÉ';
      break;
    default:
      statusColor = [107, 114, 128];
      statusBg = [249, 250, 251];
      statusText = statusValue.toString().toUpperCase();
  }
  
  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.rect(20, yPosition - 10, pageWidth - 40, 15, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`STATUT: ${statusText}`, pageWidth / 2, yPosition - 2, { align: 'center' });
  
  // Date de génération
  yPosition += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - ${companySettings.name}`, 
           pageWidth / 2, yPosition, { align: 'center' });
  
  // Télécharger le PDF
  doc.save(`feuille-route-${stop.city}-${stop.date}.pdf`);
};
