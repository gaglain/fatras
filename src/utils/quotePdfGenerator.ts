import jsPDF from 'jspdf';

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Quote {
  id: string;
  quote_number: string;
  title: string;
  description?: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  valid_until?: string;
  terms?: string;
  notes?: string;
  created_at: string;
}

export const generateQuotePDF = (quote: Quote, items: QuoteItem[], companyInfo?: any) => {
  const doc = new jsPDF();
  
  // Configuration
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = margin;

  // En-tête
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Informations entreprise (si disponibles)
  if (companyInfo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(companyInfo.name || 'Fatras Booking', margin, yPosition);
    yPosition += 6;
    if (companyInfo.address) {
      doc.text(companyInfo.address, margin, yPosition);
      yPosition += 6;
    }
    if (companyInfo.email) {
      doc.text(companyInfo.email, margin, yPosition);
      yPosition += 6;
    }
  }

  yPosition += 10;

  // Informations du devis
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Devis N° ${quote.quote_number}`, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Titre: ${quote.title}`, margin, yPosition);
  yPosition += 6;

  if (quote.description) {
    doc.text(`Description: ${quote.description}`, margin, yPosition);
    yPosition += 6;
  }

  doc.text(`Date de création: ${new Date(quote.created_at).toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 6;

  if (quote.valid_until) {
    doc.text(`Valable jusqu'au: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Tableau des articles
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Articles:', margin, yPosition);
  yPosition += 8;

  // En-têtes du tableau
  const tableHeaders = ['Désignation', 'Qté', 'Prix unit.', 'Total'];
  const tableWidths = [100, 20, 30, 30];
  let xPosition = margin;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Dessiner les en-têtes
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += tableWidths[index];
  });
  yPosition += 6;

  // Ligne de séparation
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // Articles
  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    xPosition = margin;
    
    // Nom de l'article
    doc.text(item.name, xPosition, yPosition);
    xPosition += tableWidths[0];
    
    // Quantité
    doc.text(item.quantity.toString(), xPosition, yPosition);
    xPosition += tableWidths[1];
    
    // Prix unitaire
    doc.text(`${item.unit_price.toFixed(2)} €`, xPosition, yPosition);
    xPosition += tableWidths[2];
    
    // Total
    doc.text(`${item.total_price.toFixed(2)} €`, xPosition, yPosition);
    
    yPosition += 6;

    // Description si présente
    if (item.description) {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(item.description, margin + 5, yPosition);
      yPosition += 4;
      doc.setFontSize(10);
      doc.setTextColor(0);
    }
  });

  yPosition += 10;

  // Ligne de séparation
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Totaux
  doc.setFont('helvetica', 'bold');
  const totalX = pageWidth - margin - 60;

  // Calculs sécurisés
  const computedSubtotal = items.reduce((sum, it) => sum + (it.total_price || 0), 0);
  const vatRate = (quote as any)?.vat_rate != null ? Number((quote as any).vat_rate) : 0;
  const computedTax = quote.tax_amount != null ? quote.tax_amount : (computedSubtotal * vatRate) / 100;
  const computedTotal = quote.total_amount != null ? quote.total_amount : (computedSubtotal + computedTax);

  // Remise
  if (quote.discount_amount && quote.discount_amount > 0) {
    doc.text(`Remise: -${quote.discount_amount.toFixed(2)} €`, totalX, yPosition);
    yPosition += 6;
  }

  // Total HT
  doc.text(`Total HT: ${computedSubtotal.toFixed(2)} €`, totalX, yPosition);
  yPosition += 6;

  // TVA avec taux
  doc.text(`TVA (${vatRate}%): ${computedTax.toFixed(2)} €`, totalX, yPosition);
  yPosition += 6;

  // Total TTC
  doc.setFontSize(12);
  doc.text(`TOTAL TTC: ${computedTotal.toFixed(2)} €`, totalX, yPosition);
  yPosition += 15;

  // Conditions
  if (quote.terms) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Conditions:', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    const terms = doc.splitTextToSize(quote.terms, pageWidth - 2 * margin);
    doc.text(terms, margin, yPosition);
    yPosition += terms.length * 4;
  }

  // Notes
  if (quote.notes) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    const notes = doc.splitTextToSize(quote.notes, pageWidth - 2 * margin);
    doc.text(notes, margin, yPosition);
  }

  // Pied de page
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Document généré automatiquement par Fatras Booking', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};