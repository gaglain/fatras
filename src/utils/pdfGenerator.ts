
import jsPDF from 'jspdf';
import { TourStop } from '@/types/roadshow.types';

export const generateTourStopPDF = (stop: TourStop, getUserById: (userId: string) => { name: string } | undefined) => {
  const doc = new jsPDF();
  
  // Configuration de base
  doc.setFont('helvetica');
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  
  // Titre principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FEUILLE DE ROUTE', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(16);
  doc.text(`${stop.city} - ${stop.venue}`, pageWidth / 2, yPosition, { align: 'center' });
  
  // Ligne de séparation
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Informations principales
  doc.setFont('helvetica', 'bold');
  doc.text('LIEU ET HORAIRES', 20, yPosition);
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
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
  
  // Casting
  doc.setFont('helvetica', 'bold');
  doc.text('CASTING', 20, yPosition);
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  
  if (stop.artistLineup.length > 0) {
    stop.artistLineup.forEach(artist => {
      const user = getUserById(artist.userId);
      const status = artist.confirmed ? '✓ Confirmé' : '⏳ En attente';
      doc.text(`• ${user?.name || 'Artiste inconnu'} - ${status}`, 25, yPosition);
      yPosition += 6;
    });
  } else {
    doc.text('• Aucun artiste assigné', 25, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Capacité
  doc.setFont('helvetica', 'bold');
  doc.text('CAPACITÉ', 20, yPosition);
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Capacité totale: ${stop.capacity} personnes`, 25, yPosition);
  yPosition += 6;
  if (stop.ticketsAvailable) {
    doc.text(`Billets disponibles: ${stop.ticketsAvailable}`, 25, yPosition);
    yPosition += 6;
  }
  
  // Contact local
  if (stop.localContact) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT LOCAL', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text('HÉBERGEMENT', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSPORT', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Transport: ${stop.transport}`, 25, yPosition);
    yPosition += 6;
  }
  
  // Notes
  if (stop.notes) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES IMPORTANTES', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    
    // Diviser les notes en lignes pour éviter le débordement
    const noteLines = doc.splitTextToSize(stop.notes, pageWidth - 50);
    noteLines.forEach((line: string) => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
  }
  
  // Statut en bas
  yPosition = doc.internal.pageSize.getHeight() - 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const statusText = stop.status === 'confirmed' ? '✅ CONFIRMÉ' : 
                    stop.status === 'pending' ? '⏳ EN ATTENTE' : '❌ ANNULÉ';
  doc.text(`STATUT: ${statusText}`, pageWidth / 2, yPosition, { align: 'center' });
  
  // Date de génération
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
           pageWidth / 2, yPosition, { align: 'center' });
  
  // Télécharger le PDF
  doc.save(`feuille-route-${stop.city}-${stop.date}.pdf`);
};
