import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface CinematicLoaderProps {
  onComplete?: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [statusText, setStatusText] = useState('Loading scene');

  const topShutterRef = useRef<HTMLDivElement>(null);
  const bottomShutterRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Accelerate towards 100%
      const step = Math.max(1, Math.floor((100 - current) * 0.15) + Math.floor(Math.random() * 5));
      current = Math.min(100, current + step);
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setStatusText('Ready to explore');

        // Shutter reveal animation
        setTimeout(() => {
          const tl = gsap.timeline({
            onComplete: () => {
              setIsDone(true);
              onComplete?.();
            },
          });

          // Fade out counter content
          tl.to(contentRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
          });

          // Split shutter reveal
          tl.to(
            topShutterRef.current,
            {
              yPercent: -100,
              duration: 0.75,
              ease: 'power3.inOut',
            },
            '+=0.1'
          );

          tl.to(
            bottomShutterRef.current,
            {
              yPercent: 100,
              duration: 0.75,
              ease: 'power3.inOut',
            },
            '<'
          );
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden">
      {/* Top Shutter */}
      <div
        ref={topShutterRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#050a1c] border-b border-[#37d3fc]/20 z-10"
      />

      {/* Bottom Shutter */}
      <div
        ref={bottomShutterRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#050a1c] border-t border-[#37d3fc]/20 z-10"
      />

      {/* Center Counter & Status */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-20 text-[#d5ddfd]"
      >
        <div className="flex items-baseline gap-2 font-headline text-6xl sm:text-7xl md:text-8xl font-black tracking-tight">
          <span className="text-[#37d3fc]">{progress}</span>
          <span className="text-xl sm:text-2xl text-[#94a3b8] font-ui">%</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-[#37d3fc] animate-pulse shadow-[0_0_8px_#37d3fc]" />
          <span className="font-ui text-xs tracking-[0.24em] uppercase text-[#94a3b8]">
            {statusText}
          </span>
        </div>

        {/* Progress bar track */}
        <div className="w-48 sm:w-64 h-[2px] bg-white/10 mt-6 overflow-hidden">
          <div
            className="h-full bg-[#37d3fc] transition-all duration-75 shadow-[0_0_10px_#37d3fc]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="font-ui text-[11px] tracking-[0.2em] uppercase text-[#d5ddfd]/80">
            ZEROLEAK AI // ENTERPRISE DPDP GATEWAY
          </div>
          <div className="font-ui text-[9px] tracking-[0.24em] uppercase text-[#37d3fc]/70">
            PRIVACY. PROTECTED. INTELLIGENCE. UNLEASHED.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicLoader;
