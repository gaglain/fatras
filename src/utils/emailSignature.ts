
import { User } from '@/contexts/UserContext';

export const generateEmailSignature = (user: User | null): string => {
  if (!user) return '';

  const fullName = `${user.name} ${user.lastName}`.trim();
  const company = 'Fatras Booking';
  const email = 'Booking@fatras.net';
  const website = 'https://fatras.net';
  
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <div style="border-left: 3px solid #8b5cf6; padding-left: 15px; margin: 20px 0;">
        ${user.avatar ? `<img src="${user.avatar}" alt="${fullName}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; object-fit: cover;" />` : ''}
        <div style="font-weight: bold; font-size: 16px; color: #8b5cf6;">${fullName}</div>
        ${user.department ? `<div style="color: #666; margin: 2px 0;">${user.department}</div>` : ''}
        <div style="color: #666; margin: 2px 0;">${company}</div>
        <div style="margin: 5px 0;"><span style="color: #8b5cf6;">✉️</span> ${email}</div>
        <div style="margin: 5px 0;"><span style="color: #8b5cf6;">🌐</span> <a href="${website}" style="color: #8b5cf6; text-decoration: none;">${website}</a></div>
        <div style="margin: 10px 0;">
          <a href="https://www.facebook.com/fatrasmusic" style="margin-right: 8px; color: #8b5cf6; text-decoration: none;">Facebook</a>
          <a href="https://www.instagram.com/fatrasmusic" style="margin-right: 8px; color: #8b5cf6; text-decoration: none;">Instagram</a>
          <a href="https://www.youtube.com/@fatrasmusic" style="color: #8b5cf6; text-decoration: none;">YouTube</a>
        </div>
      </div>
    </div>
  `.trim();
};

export const getPlainTextSignature = (user: User | null): string => {
  if (!user) return '';

  const fullName = `${user.name} ${user.lastName}`.trim();
  const company = 'Fatras Booking';
  const email = 'Booking@fatras.net';
  const website = 'https://fatras.net';
  
  let signature = `\n\n---\n${fullName}\n${company}`;
  
  if (user.department) {
    signature += `\n${user.department}`;
  }
  
  signature += `\nEmail: ${email}`;
  signature += `\nWeb: ${website}`;
  signature += `\nFacebook: https://www.facebook.com/fatrasmusic`;
  signature += `\nInstagram: https://www.instagram.com/fatrasmusic`;
  signature += `\nYouTube: https://www.youtube.com/@fatrasmusic`;
  
  return signature;
};
