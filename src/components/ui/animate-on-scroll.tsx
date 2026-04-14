'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Animation = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-in' | 'blur-in';

export function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseStyles: Record<Animation, { hidden: string; visible: string }> = {
    'fade-up': {
      hidden: 'opacity-0 translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-in': {
      hidden: 'opacity-0',
      visible: 'opacity-100',
    },
    'fade-left': {
      hidden: 'opacity-0 -translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      hidden: 'opacity-0 translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
    'scale-in': {
      hidden: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    'blur-in': {
      hidden: 'opacity-0 blur-sm',
      visible: 'opacity-100 blur-0',
    },
  };

  const styles = baseStyles[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? styles.visible : styles.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
