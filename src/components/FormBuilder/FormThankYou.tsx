import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink } from 'lucide-react';
import { ThankYouPage } from './types';
import { cn } from '@/lib/utils';

interface FormThankYouProps {
  config?: ThankYouPage;
  fallbackMessage: string;
  redirectUrl?: string;
}

export const FormThankYou: React.FC<FormThankYouProps> = ({
  config,
  fallbackMessage,
  redirectUrl,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const title = config?.title || 'Merci !';
  const message = config?.message || fallbackMessage;
  const delay = config?.redirectDelay ?? (redirectUrl ? 3 : 0);
  const finalRedirect = config?.ctaUrl || redirectUrl;

  useEffect(() => {
    if (config?.showConfetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [config?.showConfetti]);

  // Auto redirect countdown
  useEffect(() => {
    if (finalRedirect && delay > 0) {
      setCountdown(delay);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            window.location.href = finalRedirect;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [finalRedirect, delay]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-[confetti-fall_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                backgroundColor: [
                  'hsl(var(--primary))',
                  '#f59e0b',
                  '#10b981',
                  '#ef4444',
                  '#8b5cf6',
                  '#ec4899',
                ][Math.floor(Math.random() * 6)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center max-w-md mx-auto animate-fade-in space-y-6">
        {/* Image */}
        {config?.imageUrl ? (
          <img
            src={config.imageUrl}
            alt="Merci"
            className="max-h-40 w-auto mx-auto rounded-lg object-contain"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-primary" />
          </div>
        )}

        {/* Title */}
        <h2 className="text-3xl font-bold">{title}</h2>

        {/* Message */}
        <p className="text-lg opacity-80">{message}</p>

        {/* CTA Button */}
        {config?.ctaText && config?.ctaUrl && (
          <Button
            size="lg"
            className="gap-2"
            onClick={() => window.location.href = config.ctaUrl!}
          >
            {config.ctaText}
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <p className="text-sm opacity-50">
            Redirection dans {countdown}s...
          </p>
        )}
      </div>
    </div>
  );
};
