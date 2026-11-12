import React, { lazy, Suspense, useRef, useState } from 'react';
import { useCanRun3D } from '@/hooks/useCanRun3D';
import { ThreeErrorBoundary } from '@/components/ThreeErrorBoundary';
import { CardStage2D } from '@/components/CardStage2D';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';

// Lazy-load 3D CardStage scene with React.lazy + Suspense
const LazyCardStage3D = lazy(() => import('@/components/three-d/CardStage3D'));

/**
 * CardStage Component:
 * Selectively renders 3D or 2D CardStage.
 * Uses GSAP ScrollTrigger inside useGSAP to:
 *  - Pin the stage for about 1 viewport of scroll on desktop/tablet (>= 768px),
 *    scrubbing the cards from "raw" to "masked" state.
 *  - Disable pinning below 768px, using simple fade-in.
 */
export const CardStage: React.FC = () => {
  const canRun3D = useCanRun3D();
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number | undefined>(undefined);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // 1. Desktop & Tablet (>= 768px): Pin for 1 viewport of scroll with scrub
      mm.add('(min-width: 768px)', () => {
        if (!pinContainerRef.current) return;

        ScrollTrigger.create({
          trigger: pinContainerRef.current,
          pin: true,
          start: 'top top',
          end: '+=100%', // about 1 viewport of scroll
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
          onLeaveBack: () => {
            setScrollProgress(0);
          },
        });
      });

      // 2. Mobile (< 768px): Disable pinning, use simple fade-in
      mm.add('(max-width: 767px)', () => {
        setScrollProgress(undefined);
        if (!pinContainerRef.current) return;

        gsap.from(pinContainerRef.current, {
          opacity: 0,
          y: 25,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: pinContainerRef.current,
            start: 'top 85%',
          },
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: pinContainerRef }
  );

  return (
    <div ref={pinContainerRef} className="relative w-full">
      {!canRun3D ? (
        <CardStage2D scrollProgress={scrollProgress} />
      ) : (
        <ThreeErrorBoundary fallback={<CardStage2D scrollProgress={scrollProgress} />}>
          <Suspense fallback={<CardStage2D scrollProgress={scrollProgress} />}>
            <LazyCardStage3D scrollProgress={scrollProgress} />
          </Suspense>
        </ThreeErrorBoundary>
      )}
    </div>
  );
};

export default CardStage;
