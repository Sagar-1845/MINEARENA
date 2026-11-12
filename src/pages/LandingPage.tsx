import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SmoothScrollProvider } from '@/components/hubtown/SmoothScrollProvider';
import { CinematicLoader } from '@/components/cinematic/CinematicLoader';
import { HudFrame } from '@/components/cinematic/HudFrame';
import { CinematicHeader } from '@/components/cinematic/CinematicHeader';
import { ChapterIndex } from '@/components/cinematic/ChapterIndex';
import { HudBottomBar } from '@/components/cinematic/HudBottomBar';
import { ChapterContent } from '@/components/cinematic/ChapterContent';
import { FullscreenMenu } from '@/components/cinematic/FullscreenMenu';
import { CinematicCanvas } from '@/components/cinematic/3d/CinematicCanvas';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // Motion ON/OFF state (initialized based on user's system preferences)
  const [isMotionOn, setIsMotionOn] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Jump smoothly to a specific chapter (0 to 5)
  const jumpToChapter = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(5, index));
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = (clampedIndex / 5) * maxScroll;

      if (!isMotionOn) {
        window.scrollTo(0, targetScroll);
      } else {
        // Use smooth scroll
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
      setCurrentChapter(clampedIndex);
    },
    [isMotionOn]
  );

  // Keyboard navigation between chapters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if menu is open or active element is an input
      if (isMenuOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        jumpToChapter(currentChapter + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        jumpToChapter(currentChapter - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, jumpToChapter, isMenuOpen]);

  // Pointer move tracking for 3D parallax
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointer({ x, y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // GSAP ScrollTrigger setup on virtual scroll track (600vh)
  useEffect(() => {
    if (!scrollTrackRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: scrollTrackRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: isMotionOn ? 0.6 : 0,
      snap: isMotionOn
        ? {
            snapTo: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            duration: { min: 0.2, max: 0.7 },
            ease: 'power2.inOut',
          }
        : undefined,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);
        const activeIdx = Math.min(5, Math.max(0, Math.round(p * 5)));
        setCurrentChapter(activeIdx);
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [isMotionOn]);

  return (
    <SmoothScrollProvider>
      {/* 1. Numerical 0% -> 100% Loader with Split Shutter Reveal */}
      <CinematicLoader />

      {/* 2. Fixed Full-Viewport Stage */}
      <main className="fixed inset-0 w-full h-full overflow-hidden select-none bg-gradient-to-br from-[#050a1c] to-[#0a1f3d]">
        {/* 3D WebGL Monolith & Procedural Stations */}
        <CinematicCanvas
          scrollProgress={scrollProgress}
          pointer={pointer}
          isMotionOn={isMotionOn}
        />

        {/* HUD Inset Border with Chamfered Top-Right Corner */}
        <HudFrame />

        {/* Global HUD Header (Wordmark, Nav, Chamfered Buttons) */}
        <CinematicHeader
          onOpenMenu={() => setIsMenuOpen(true)}
          onJumpToChapter={jumpToChapter}
        />

        {/* Left Vertical Chapter Index */}
        <ChapterIndex
          currentChapter={currentChapter}
          onSelectChapter={jumpToChapter}
        />

        {/* Central Chapter Headline Scramble, Copy, and CTA */}
        <ChapterContent
          currentChapter={currentChapter}
          isMotionOn={isMotionOn}
        />

        {/* Bottom HUD Bar (Motion Toggle, Prev/Next, Live Demo Link) */}
        <HudBottomBar
          currentChapter={currentChapter}
          isMotionOn={isMotionOn}
          onToggleMotion={() => setIsMotionOn((prev) => !prev)}
          onPrevChapter={() => jumpToChapter(currentChapter - 1)}
          onNextChapter={() => jumpToChapter(currentChapter + 1)}
        />

        {/* Fullscreen Architectural Menu Overlay */}
        <FullscreenMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelectChapter={jumpToChapter}
        />
      </main>

      {/* 3. 600vh Virtual Scroll Track (Enables smooth wheel & touch scrolling through 6 chapters) */}
      <div
        ref={scrollTrackRef}
        className="relative w-full h-[600vh] pointer-events-none"
        aria-hidden="true"
      />
    </SmoothScrollProvider>
  );
};

export default LandingPage;
