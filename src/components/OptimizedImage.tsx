import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Composant d'image optimisé avec :
 * - Lazy loading natif
 * - Placeholder pendant le chargement
 * - Gestion des erreurs
 * - Support fetchpriority pour LCP
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  objectFit = 'cover',
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Réinitialiser l'état si la source change
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none'
  }[objectFit];

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image indisponible</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // @ts-ignore - fetchpriority est supporté mais pas encore typé
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClass,
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};

/**
 * Composant pour les images de fond optimisées
 * Utilise une image réelle plutôt que background-image CSS
 * pour permettre le lazy loading et améliorer le LCP
 */
interface OptimizedBackgroundProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
  overlay?: boolean;
  overlayClassName?: string;
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  alt = '',
  className,
  children,
  priority = false,
  overlay = true,
  overlayClassName = 'bg-black/30'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder gradient pendant le chargement */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"
          aria-hidden="true"
        />
      )}
      
      {/* Image de fond */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // @ts-ignore
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Overlay optionnel */}
      {overlay && (
        <div className={cn('absolute inset-0', overlayClassName)} aria-hidden="true" />
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
