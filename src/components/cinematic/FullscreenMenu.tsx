import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS } from './types';
import { X, ArrowRight, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (index: number) => void;
}

export const FullscreenMenu: React.FC<FullscreenMenuProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape & Lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 md:p-16 bg-[#050a1c]/98 backdrop-blur-2xl text-[#d5ddfd] select-none animate-fadeIn"
    >
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#37d3fc]/20 via-transparent to-transparent" />
      <div className="absolute inset-4 pointer-events-none border border-white/10 clip-chamfer-tr" />

      {/* Header bar inside menu */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[#37d3fc] shadow-[0_0_8px_#37d3fc]" />
          <span className="font-ui text-xs tracking-[0.2em] uppercase text-[#37d3fc]">
            SYSTEM DIRECTORY // ZEROLEAK AI
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="clip-chamfer flex items-center gap-2 px-4 py-2 border border-[#d5ddfd]/30 hover:border-white bg-[#d5ddfd] text-[#050a1c] hover:bg-white text-xs font-ui tracking-[0.16em] uppercase transition-all cursor-pointer font-bold"
        >
          <X className="w-4 h-4" />
          <span>CLOSE [ESC]</span>
        </button>
      </div>

      {/* Main Menu Links Grid */}
      <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start max-w-7xl mx-auto w-full pt-8 pb-8">
        {/* Left Column: Chapters / Storyline Navigation */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="text-[11px] font-ui tracking-[0.2em] uppercase text-[#94a3b8] flex items-center gap-2">
            <span>01 // CHAPTER ARCHITECTURE</span>
            <span className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="flex flex-col gap-3">
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChapter(ch.index);
                  onClose();
                }}
                className="group flex items-baseline justify-between text-left py-2 px-3 border border-transparent hover:border-[#37d3fc]/40 hover:bg-[#37d3fc]/5 rounded transition-all cursor-pointer"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-ui text-xs text-[#37d3fc] tracking-widest font-mono">
                    0{ch.index + 1}
                  </span>
                  <span className="font-headline text-2xl sm:text-3xl tracking-tight text-[#d5ddfd] group-hover:text-white group-hover:translate-x-2 transition-all">
                    {ch.navLabel}
                  </span>
                </div>
                <span className="hidden sm:inline-block font-ui text-[11px] tracking-widest text-[#94a3b8] group-hover:text-[#37d3fc] uppercase transition-colors">
                  JUMP TO SCENE →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Gateway Routes & Live Tools */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="text-[11px] font-ui tracking-[0.2em] uppercase text-[#94a3b8] flex items-center gap-2">
            <span>02 // LIVE ENTERPRISE MODULES</span>
            <span className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Demo Route */}
            <Link
              to="/demo"
              onClick={onClose}
              className="p-5 border border-white/10 hover:border-[#37d3fc] bg-[#0a1f3d]/40 hover:bg-[#0a1f3d]/80 rounded transition-all group clip-chamfer"
            >
              <div className="flex items-center justify-between mb-3 text-[#37d3fc]">
                <Cpu className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-headline text-lg text-white mb-1">LIVE GATEWAY</div>
              <p className="text-xs text-[#94a3b8] font-body line-clamp-2">
                Process unstructured prompts, inspect redaction tokens & real-time reinsertion.
              </p>
            </Link>

            {/* Audit Log Route */}
            <Link
              to="/audit"
              onClick={onClose}
              className="p-5 border border-white/10 hover:border-[#37d3fc] bg-[#0a1f3d]/40 hover:bg-[#0a1f3d]/80 rounded transition-all group clip-chamfer"
            >
              <div className="flex items-center justify-between mb-3 text-[#37d3fc]">
                <ShieldCheck className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-headline text-lg text-white mb-1">AUDIT TRAIL</div>
              <p className="text-xs text-[#94a3b8] font-body line-clamp-2">
                Immutable cryptographic verification logs, tamper signatures & DPDP compliance.
              </p>
            </Link>

            {/* Metrics Route */}
            <Link
              to="/metrics"
              onClick={onClose}
              className="p-5 border border-white/10 hover:border-[#37d3fc] bg-[#0a1f3d]/40 hover:bg-[#0a1f3d]/80 rounded transition-all group clip-chamfer"
            >
              <div className="flex items-center justify-between mb-3 text-[#37d3fc]">
                <Activity className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-headline text-lg text-white mb-1">TELEMETRY</div>
              <p className="text-xs text-[#94a3b8] font-body line-clamp-2">
                Zero-leak benchmarks, latency percentiles, precision rates & throughput graphs.
              </p>
            </Link>

            {/* Dataset Route */}
            <Link
              to="/dataset"
              onClick={onClose}
              className="p-5 border border-white/10 hover:border-[#37d3fc] bg-[#0a1f3d]/40 hover:bg-[#0a1f3d]/80 rounded transition-all group clip-chamfer"
            >
              <div className="flex items-center justify-between mb-3 text-[#37d3fc]">
                <Database className="w-5 h-5" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="font-headline text-lg text-white mb-1">SYNTHETIC DATASET</div>
              <p className="text-xs text-[#94a3b8] font-body line-clamp-2">
                Fictional sample records for Aadhaar, PAN, GSTIN, Passport and Voter IDs.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer bar inside menu */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-ui tracking-[0.16em] uppercase text-[#94a3b8] pt-6 border-t border-white/10">
        <div>ON-PREMISES DPDP GATEWAY ENGINE // V2.4</div>
        <div className="text-white/80 mt-2 sm:mt-0">
          MineArena 1.0 | Code Commit | BIET Davangere
        </div>
      </div>
    </div>
  );
};

export default FullscreenMenu;
