import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/UserContext';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager / Booker',
  artiste: 'Artiste',
  utilisateur: 'Utilisateur'
};

export const exportSingleUserToPDF = (user: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fiche Utilisateur', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(14);
  doc.text(`${user.first_name || ''} ${user.last_name || ''}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  doc.setFontSize(11);
  const details = [
    { label: 'Email', value: user.email || 'Non renseigné' },
    { label: 'Nom d\'utilisateur', value: user.username || 'Non renseigné' },
    { label: 'Rôle', value: roleLabels[user.role as UserRole] || user.role || 'Non renseigné' },
    { label: 'Téléphone', value: user.phone || 'Non renseigné' },
    { label: 'Fonction', value: user.function_title || 'Non renseigné' },
    { label: 'Nom de scène', value: user.show_name || 'Non renseigné' },
    { label: 'Adresse', value: user.address || 'Non renseigné' },
    { label: 'Ville', value: user.city || 'Non renseigné' },
    { label: 'Date de naissance', value: user.birth_date || 'Non renseigné' },
    { label: 'Lieu de naissance', value: user.birth_place || 'Non renseigné' },
    { label: 'Nationalité', value: user.nationality || 'Non renseigné' },
    { label: 'N° Sécurité Sociale', value: user.social_security_number || 'Non renseigné' },
  ];

  details.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 8;
  });

  if (user.bank_details) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Coordonnées bancaires', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(11);

    const bankInfo = [
      { label: 'IBAN', value: user.bank_details.iban || 'Non renseigné' },
      { label: 'BIC', value: user.bank_details.bic || 'Non renseigné' },
      { label: 'Banque', value: user.bank_details.bankName || 'Non renseigné' },
      { label: 'Titulaire', value: user.bank_details.accountHolder || 'Non renseigné' },
    ];

    bankInfo.forEach(({ label, value }) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 25, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 7;
    });
  }

  if (user.skills && user.skills.length > 0) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Compétences', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(user.skills.join(', '), 25, yPosition);
  }

  doc.setFontSize(8);
  doc.text('Page 1 / 1', pageWidth / 2, 290, { align: 'center' });

  const fileName = `utilisateur_${(user.first_name || 'user').toLowerCase()}_${(user.last_name || '').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  toast.success('Fiche utilisateur exportée');
};

export const exportUsersToPDF = (filteredUsers: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Liste des Utilisateurs', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  filteredUsers.forEach((user, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${user.first_name || ''} ${user.last_name || ''}`, 15, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const details = [
      `Email: ${user.email || 'Non renseigné'}`,
      `Rôle: ${roleLabels[user.role as UserRole] || user.role || 'Non renseigné'}`,
      `Téléphone: ${user.phone || 'Non renseigné'}`,
      `Fonction: ${user.function_title || 'Non renseigné'}`,
      `Nom de scène: ${user.show_name || 'Non renseigné'}`,
      `Adresse: ${user.address || 'Non renseigné'}`,
      `Ville: ${user.city || 'Non renseigné'}`,
      `Nationalité: ${user.nationality || 'Non renseigné'}`,
    ];

    details.forEach(detail => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(detail, 20, yPosition);
      yPosition += 5;
    });

    yPosition += 8;
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`utilisateurs_${new Date().toISOString().split('T')[0]}.pdf`);
  toast.success('Export PDF généré avec succès');
};
