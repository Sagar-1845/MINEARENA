import React, { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [scrambleText, setScrambleText] = useState('10 EAILJCPKM');
  const [scrambleSub, setScrambleSub] = useState('RZKZGMRHSCYLNLRY');
  const [isDone, setIsDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsDone(true);
      onComplete?.();
      return;
    }

    // Fast character scrambler during load
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$&%';
    const scrambleInterval = setInterval(() => {
      let t1 = '10 ';
      for (let i = 0; i < 9; i++) {
        t1 += chars[Math.floor(Math.random() * chars.length)];
      }
      let t2 = '';
      for (let i = 0; i < 16; i++) {
        t2 += chars[Math.floor(Math.random() * chars.length)];
      }
      setScrambleText(t1);
      setScrambleSub(t2);
    }, 60);

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        clearInterval(scrambleInterval);
        setIsDone(true);
        onComplete?.();
      },
    });

    // Count up 0 -> 100%
    tl.to(counter, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(Math.round(counter.val));
      },
    });

    // Content fade out
    tl.to(contentRef.current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.35,
      ease: 'power2.in',
    });

    // Split curtain exit
    tl.to(
      topCurtainRef.current,
      {
        yPercent: -100,
        duration: 0.75,
        ease: 'power4.inOut',
      },
      '-=0.1'
    );

    tl.to(
      bottomCurtainRef.current,
      {
        yPercent: 100,
        duration: 0.75,
        ease: 'power4.inOut',
      },
      '<'
    );

    return () => {
      clearInterval(scrambleInterval);
      tl.kill();
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
    >
      {/* Top Half Curtain */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#020A19] border-b border-[#D5E0FF]/10"
      />

      {/* Bottom Half Curtain */}
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#020A19] border-t border-[#D5E0FF]/10"
      />

      {/* Center Preloader Brand & Scrambler */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
      >
        {/* Geometric Hubtown-Grade Logo: ZEROLEAK */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <svg
            viewBox="0 0 340 40"
            className="w-56 sm:w-72 md:w-80 h-auto text-[#D5E0FF]"
            fill="currentColor"
          >
            {/* Z */}
            <path d="M 0 0 H 36 V 8 L 10 32 H 36 V 40 H 0 V 32 L 26 8 H 0 Z" />
            {/* E */}
            <path d="M 46 0 H 82 V 8 H 56 V 16 H 78 V 24 H 56 V 32 H 82 V 40 H 46 Z" />
            {/* R */}
            <path d="M 92 0 H 128 V 22 H 102 V 40 H 92 Z M 102 8 V 14 H 118 V 8 Z M 116 22 L 128 40 H 116 L 106 24 Z" />
            {/* O (cut triangle) */}
            <path d="M 138 0 H 174 V 40 H 138 Z M 148 8 V 32 H 164 L 148 16 Z" />
            {/* L */}
            <path d="M 184 0 H 194 V 32 H 220 V 40 H 184 Z" />
            {/* E */}
            <path d="M 230 0 H 266 V 8 H 240 V 16 H 262 V 24 H 240 V 32 H 266 V 40 H 230 Z" />
            {/* A */}
            <path d="M 276 0 H 312 V 40 H 302 V 24 H 286 V 40 H 276 Z M 286 8 V 16 H 302 V 8 Z" />
            {/* K */}
            <path d="M 322 0 H 332 V 40 H 322 Z M 332 20 L 348 0 H 360 L 340 22 L 360 40 H 348 L 332 22 Z" />
          </svg>
        </div>

        {/* Scrambler alphanumeric badge below logo */}
        <div className="flex flex-col items-start bg-[#D5E0FF]/10 border border-[#D5E0FF]/20 px-2 py-1 rounded text-[9px] font-mono tracking-widest text-[#D5E0FF] mt-1 select-none">
          <div className="font-semibold text-[#00F5FF]">{scrambleText}</div>
          <div className="text-[#D5E0FF]/60 text-[8px]">{scrambleSub}</div>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="mt-8 flex items-center gap-3 text-xs font-mono text-[#D5E0FF]/80 tracking-widest uppercase">
          <span>{progress.toString().padStart(2, '0')}%</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-ping" />
          <span>INITIALIZING PRIVACY PERIMETER</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;