import React from 'react';
import { Link } from 'react-router-dom';

interface HudBottomBarProps {
  currentChapter: number;
  isMotionOn: boolean;
  onToggleMotion: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const HudBottomBar: React.FC<HudBottomBarProps> = ({
  currentChapter,
  isMotionOn,
  onToggleMotion,
  onPrevChapter,
  onNextChapter,
}) => {
  const isLastChapter = currentChapter === 5;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 h-16 px-6 sm:px-10 md:px-12 flex items-center justify-between pointer-events-none select-none text-[11px] font-ui tracking-[0.16em] uppercase text-[#94a3b8]">
      {/* Bottom Left: MOTION: ON/OFF toggle */}
      <div className="pointer-events-auto flex items-center gap-4">
        <button
          onClick={onToggleMotion}
          aria-pressed={isMotionOn}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-[#37d3fc]/60 bg-[#050a1c]/60 backdrop-blur-md text-[#d5ddfd] hover:text-white transition-colors cursor-pointer clip-chamfer-sm"
        >
          <span
            className={`w-1.5 h-1.5 ${
              isMotionOn ? 'bg-[#37d3fc] shadow-[0_0_6px_#37d3fc]' : 'bg-[#94a3b8]'
            }`}
          />
          <span>MOTION: {isMotionOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Prev / Next controls */}
        <div className="hidden sm:flex items-center gap-2 text-[10px]">
          <button
            onClick={onPrevChapter}
            disabled={currentChapter === 0}
            className="hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            PREV.
          </button>
          <span>/</span>
          <button
            onClick={onNextChapter}
            disabled={isLastChapter}
            className="hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Bottom Center: Chapter indicator */}
      <div className="hidden md:flex items-center gap-2 text-[10px] text-[#94a3b8]">
        <span>CHAPTER 0{currentChapter + 1} // 06</span>
      </div>

      {/* Bottom Right: OPEN LIVE DEMO (Chapters 0-4) or Links (Chapter 5) */}
      <div className="pointer-events-auto flex items-center gap-4 text-[#d5ddfd]">
        {!isLastChapter ? (
          <Link
            to="/demo"
            className="flex items-center gap-2 hover:text-[#37d3fc] transition-colors cursor-pointer group"
          >
            <span>OPEN LIVE DEMO</span>
            {/* Pixel chevron icon */}
            <svg
              viewBox="0 0 8 8"
              className="w-2 h-2 text-[#37d3fc] fill-current group-hover:translate-x-0.5 transition-transform"
            >
              <rect x="0" y="0" width="2" height="2" />
              <rect x="2" y="2" width="2" height="2" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="2" y="6" width="2" height="2" />
            </svg>
          </Link>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4 text-[10px]">
            <Link to="/demo" className="hover:text-[#37d3fc] transition-colors">
              DEMO
            </Link>
            <span>•</span>
            <Link to="/audit" className="hover:text-[#37d3fc] transition-colors">
              AUDIT
            </Link>
            <span>•</span>
            <Link to="/metrics" className="hover:text-[#37d3fc] transition-colors">
              METRICS
            </Link>
            <span>•</span>
            <Link to="/dataset" className="hover:text-[#37d3fc] transition-colors">
              DATASET
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default HudBottomBar;