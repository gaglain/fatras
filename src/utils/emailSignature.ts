
import { User } from '@/contexts/UserContext';

export const generateEmailSignature = (user: User | null): string => {
  if (!user) return '';

  const fullName = `${user.name} ${user.lastName}`.trim();
  const company = 'Fatras Booking'; // Peut être récupéré depuis les paramètres de l'entreprise
  
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <div style="border-left: 3px solid #8b5cf6; padding-left: 15px; margin: 20px 0;">
        ${user.avatar ? `<img src="${user.avatar}" alt="${fullName}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; object-fit: cover;" />` : ''}
        <div style="font-weight: bold; font-size: 16px; color: #8b5cf6;">${fullName}</div>
        ${user.department ? `<div style="color: #666; margin: 2px 0;">${user.department}</div>` : ''}
        <div style="color: #666; margin: 2px 0;">${company}</div>
        ${user.phone ? `<div style="margin: 5px 0;"><span style="color: #8b5cf6;">📞</span> ${user.phone}</div>` : ''}
        <div style="margin: 5px 0;"><span style="color: #8b5cf6;">✉️</span> ${user.email}</div>
        ${user.bio ? `<div style="margin: 10px 0; font-style: italic; color: #666;">${user.bio}</div>` : ''}
      </div>
    </div>
  `.trim();
};

export const getPlainTextSignature = (user: User | null): string => {
  if (!user) return '';

  const fullName = `${user.name} ${user.lastName}`.trim();
  const company = 'Fatras Booking';
  
  let signature = `\n\n---\n${fullName}\n${company}`;
  
  if (user.department) {
    signature += `\n${user.department}`;
  }
  
  if (user.phone) {
    signature += `\nTél: ${user.phone}`;
  }
  
  signature += `\nEmail: ${user.email}`;
  
  if (user.bio) {
    signature += `\n\n${user.bio}`;
  }
  
  return signature;
};
