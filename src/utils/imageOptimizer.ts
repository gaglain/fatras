/**
 * Utilitaire d'optimisation d'images côté client
 * Similaire à Imagify - compresse et redimensionne automatiquement les images
 */

import { logger } from '@/lib/logger';

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'webp' | 'jpeg' | 'png';
  maxSizeKB?: number; // Taille max en KB
}

export interface OptimizationResult {
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp',
  maxSizeKB: 300
};

/**
 * Charge une image depuis un fichier
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => reject(new Error('Impossible de charger l\'image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcule les nouvelles dimensions en conservant le ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let width = originalWidth;
  let height = originalHeight;

  // Si l'image est déjà plus petite, ne pas l'agrandir
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  return { width, height };
};

/**
 * Convertit un canvas en Blob avec le format et la qualité spécifiés
 */
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'webp' ? 'image/webp' : 
                     format === 'png' ? 'image/png' : 'image/jpeg';
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Échec de la conversion en blob'));
        }
      },
      mimeType,
      quality
    );
  });
};

/**
 * Optimise une image avec compression progressive si nécessaire
 */
const optimizeWithTargetSize = async (
  canvas: HTMLCanvasElement,
  format: string,
  initialQuality: number,
  maxSizeKB: number
): Promise<Blob> => {
  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, format, quality);
  
  // Compression progressive si l'image est trop grande
  const maxBytes = maxSizeKB * 1024;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (blob.size > maxBytes && quality > 0.3 && attempts < maxAttempts) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, format, quality);
    attempts++;
    logger.debug(`🔄 Optimisation: qualité=${(quality * 100).toFixed(0)}%, taille=${(blob.size / 1024).toFixed(0)}KB`);
  }
  
  // Si toujours trop grand et format est webp, essayer jpeg
  if (blob.size > maxBytes && format === 'webp') {
    logger.debug('📦 Tentative avec format JPEG...');
    blob = await canvasToBlob(canvas, 'jpeg', quality);
  }
  
  return blob;
};

/**
 * Optimise une image pour le web
 * @param file - Fichier image original
 * @param options - Options d'optimisation
 * @returns Promise avec le résultat de l'optimisation
 */
export const optimizeImage = async (
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  logger.debug(`🖼️ Optimisation de l'image: ${file.name} (${(originalSize / 1024).toFixed(0)}KB)`);

  // Vérifier si c'est une image
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier n\'est pas une image');
  }

  // Ne pas optimiser les GIFs (perte d'animation) ni les SVGs
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    logger.debug('⏭️ Format non optimisable (GIF/SVG), retour de l\'original');
    return {
      blob: file,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 1,
      width: 0,
      height: 0,
      format: file.type.split('/')[1]
    };
  }

  try {
    // Charger l'image
    const img = await loadImage(file);
    
    // Calculer les nouvelles dimensions
    const { width, height } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth!,
      opts.maxHeight!
    );

    // Créer le canvas pour le redimensionnement
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Impossible de créer le contexte canvas');
    }

    // Appliquer un lissage de haute qualité
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Dessiner l'image redimensionnée
    ctx.drawImage(img, 0, 0, width, height);

    // Optimiser avec la taille cible
    const optimizedBlob = await optimizeWithTargetSize(
      canvas,
      opts.format!,
      opts.quality!,
      opts.maxSizeKB!
    );

    const optimizedSize = optimizedBlob.size;
    const compressionRatio = originalSize / optimizedSize;

    logger.debug(`✅ Optimisation terminée: ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB, ${compressionRatio.toFixed(1)}x`);

    return {
      blob: optimizedBlob,
      originalSize,
      optimizedSize,
      compressionRatio,
      width,
      height,
      format: opts.format!
    };
  } catch (error: unknown) {
    logger.error('❌ Erreur lors de l\'optimisation:', error);
    // En cas d'erreur, retourner le fichier original
    return {
      blob: file,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 1,
      width: 0,
      height: 0,
      format: file.type.split('/')[1]
    };
  }
};

/**
 * Crée un nouveau fichier à partir d'un blob optimisé
 */
export const createOptimizedFile = (
  blob: Blob,
  originalName: string,
  format: string
): File => {
  const extension = format === 'webp' ? 'webp' : format === 'png' ? 'png' : 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const newName = `${baseName}.${extension}`;
  
  return new File([blob], newName, { type: blob.type });
};

/**
 * Vérifie si un fichier doit être optimisé
 */
export const shouldOptimize = (file: File, thresholdKB: number = 100): boolean => {
  // Optimiser si le fichier fait plus de 100KB par défaut
  if (file.size > thresholdKB * 1024) return true;
  
  // Ne pas optimiser les petits fichiers
  return false;
};
