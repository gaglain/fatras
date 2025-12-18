import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

// Hook for multiple elements
export function useScrollAnimations(
  count: number,
  options: UseScrollAnimationOptions = {}
): { refs: RefObject<HTMLElement>[]; visibilities: boolean[] } {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const refs = useRef<RefObject<HTMLElement>[]>(
    Array.from({ length: count }, () => ({ current: null }))
  );
  const [visibilities, setVisibilities] = useState<boolean[]>(
    Array(count).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.current.forEach((ref, index) => {
      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibilities((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setVisibilities((prev) => {
              const next = [...prev];
              next[index] = false;
              return next;
            });
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [count, threshold, rootMargin, triggerOnce]);

  return { refs: refs.current, visibilities };
}

// Animation class helper
export function getScrollAnimationClass(
  isVisible: boolean,
  animationType: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade' = 'fade-up',
  delay?: number
): string {
  const baseClasses = {
    'fade-up': 'scroll-animate',
    'fade-left': 'scroll-animate-left',
    'fade-right': 'scroll-animate-right',
    'scale': 'scroll-animate-scale',
    'fade': 'scroll-animate',
  };

  const delayClass = delay ? `animate-delay-${delay}` : '';
  const visibleClass = isVisible ? 'visible' : '';

  return `${baseClasses[animationType]} ${visibleClass} ${delayClass}`.trim();
}
