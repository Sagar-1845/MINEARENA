import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Terminal, ShieldCheck } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';

const PHASES = [
  { name: 'MISSION', active: true },
  { name: 'ENCLAVES', active: false },
  { name: 'SPECIMENS', active: false },
  { name: 'STATUTORY', active: false },
  { name: 'INTELLIGENCE', active: false },
  { name: 'SOVEREIGNTY', active: false },
];

export const HeroSectionHubtown: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ delay: 1.6 }); // Triggers gracefully as preloader doors open

      if (headlineRef.current) {
        tl.from(headlineRef.current, {
          y: 40,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out',
        });
      }

      if (subtextRef.current) {
        tl.from(
          subtextRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6'
        );
      }

      if (ctaRef.current) {
        tl.from(
          ctaRef.current,
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.4'
        );
      }
    },
    { scope: containerRef }
  );

  const handleScrollToExplore = () => {
    const el = document.getElementById('mission');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-between pt-24 pb-8 px-6 sm:px-12 md:px-16 pointer-events-none select-none"
    >
      {/* 1. Left Vertical Phase Tracker (Hubtown Signature) */}
      <div className="hidden lg:flex absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 flex-col gap-5 text-[11px] font-mono tracking-[0.2em] uppercase">
        {PHASES.map((p) => (
          <div
            key={p.name}
            className={`flex items-center gap-2.5 transition-colors ${
              p.active
                ? 'text-[#D5E0FF] font-bold'
                : 'text-[#D5E0FF]/40 hover:text-[#D5E0FF]/70'
            }`}
          >
            {p.active ? (
              <span className="w-1.5 h-1.5 bg-[#D5E0FF]" />
            ) : (
              <span className="w-1 h-1 bg-[#D5E0FF]/30" />
            )}
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Empty space in the upper/center to let the 3D Luminescent Cube take visual dominance */}
      <div className="flex-1 min-h-[30vh] sm:min-h-[40vh]" />

      {/* 2. Lower-Center Hero Text & Actions (Hubtown Composition) */}
      <div className="pointer-events-auto max-w-4xl mx-auto text-center flex flex-col items-center pb-8 z-10">
        {/* Main Architectural Uppercase Headline */}
        <h1
          ref={headlineRef}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#D5E0FF] uppercase leading-[1.12]"
        >
          <span>WE BUILD THE FUTURE</span>
          <br />
          <span className="text-white">OF ENTERPRISE DATA PRIVACY</span>
        </h1>

        {/* Paragraph: Clear, High Contrast, text-wrap: balance */}
        <p
          ref={subtextRef}
          className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-[#D5E0FF]/90 max-w-xl font-medium leading-relaxed [text-wrap:balance]"
        >
          Detects Aadhaar, PAN, GSTIN, Voter ID and Passport numbers locally,
          sends only masked text to the LLM, and restores the real values on your
          side.
        </p>

        {/* Chamfered Explore Action Button */}
        <div ref={ctaRef} className="mt-8 flex items-center justify-center gap-4">
          <Link to="/demo">
            <button className="flex items-center gap-3 px-8 py-3.5 rounded-md border border-[#D5E0FF]/30 hover:border-[#D5E0FF]/80 bg-[#020A19]/60 hover:bg-[#020A19]/90 backdrop-blur-md text-xs sm:text-sm font-mono font-bold tracking-[0.18em] uppercase text-[#D5E0FF] hover:text-white transition-all shadow-[0_0_30px_rgba(0,245,255,0.15)] cursor-pointer">
              {/* 3-dot reticle indicator */}
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]/60" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]/30" />
              </span>
              <span>LAUNCH GATEWAY DEMO</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 3. Bottom Bar: Audio / Status, Scroll to Explore, Compliance (Hubtown Bottom Bar) */}
      <div className="pointer-events-auto border-t border-[#D5E0FF]/15 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono tracking-[0.16em] uppercase text-[#D5E0FF]/70 z-10">
        {/* Left: Security Vault Status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
          <span>ON-PREMISES VAULT // ACTIVE</span>
        </div>

        {/* Center: Scroll to Explore Cue */}
        <button
          onClick={handleScrollToExplore}
          className="flex items-center gap-2 text-[#D5E0FF] hover:text-white transition-colors cursor-pointer group"
        >
          <span>⤓ SCROLL TO EXPLORE</span>
          <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Right: DPDP Compliance Guarantee */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00F5FF]" />
          <span>DPDP ACT 2023 COMPLIANT</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionHubtown;