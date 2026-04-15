'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <Link
        href="/auth/login"
        className="flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl transition-transform hover:scale-105 active:scale-95"
      >
        Umów lekcję
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
