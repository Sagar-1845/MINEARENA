import React from 'react';
import { Link } from 'react-router-dom';

interface CinematicHeaderProps {
  onOpenMenu: () => void;
  onJumpToChapter?: (index: number) => void;
}

export const CinematicHeader: React.FC<CinematicHeaderProps> = ({
  onOpenMenu,
  onJumpToChapter,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-20 px-6 sm:px-10 md:px-12 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Blocky Wordmark "ZEROLEAK AI" as inline SVG */}
      <Link
        to="/"
        className="pointer-events-auto flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#37d3fc]"
        aria-label="ZeroLeak AI Home"
      >
        <svg
          viewBox="0 0 268 32"
          className="w-40 sm:w-48 md:w-56 h-auto text-[#d5ddfd] group-hover:text-white transition-colors"
        >
          {/* ZEROLEAK (Blocky Stencil) */}
          <g fill="currentColor">
            {/* Z */}
            <path d="M 0 0 H 24 V 6 L 8 26 H 24 V 32 H 0 V 26 L 16 6 H 0 Z" />
            {/* E */}
            <path d="M 28 0 H 50 V 6 H 36 V 13 H 48 V 19 H 36 V 26 H 50 V 32 H 28 Z" />
            {/* R */}
            <path d="M 54 0 H 78 V 16 H 62 V 32 H 54 Z M 62 6 V 11 H 70 V 6 Z M 69 16 L 78 32 H 69 L 62 18 Z" />
            {/* O */}
            <path d="M 82 0 H 106 V 32 H 82 Z M 90 6 V 26 H 98 V 6 Z" />
            {/* L */}
            <path d="M 110 0 H 118 V 26 H 132 V 32 H 110 Z" />
            {/* E */}
            <path d="M 136 0 H 158 V 6 H 144 V 13 H 156 V 19 H 144 V 26 H 158 V 32 H 136 Z" />
            {/* A */}
            <path d="M 162 0 H 186 V 32 H 178 V 18 H 170 V 32 H 162 Z M 170 6 V 12 H 178 V 6 Z" />
            {/* K */}
            <path d="M 190 0 H 198 V 13 L 209 0 H 218 L 204 16 L 218 32 H 208 L 198 19 V 32 H 190 Z" />
          </g>
          {/* AI (Electric Cyan Accent) */}
          <g fill="#37d3fc" className="drop-shadow-[0_0_8px_rgba(55,211,252,0.6)]">
            {/* A */}
            <path d="M 226 0 H 248 V 32 H 240 V 18 H 234 V 32 H 226 Z M 234 6 V 12 H 240 V 6 Z" />
            {/* I */}
            <path d="M 252 0 H 260 V 32 H 252 Z" />
          </g>
        </svg>
      </Link>

      {/* Top Right: small uppercase letter-spaced nav + buttons */}
      <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">
        {/* Uppercase Letter-Spaced Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-ui tracking-[0.16em] uppercase text-[#94a3b8]">
          <button
            onClick={() => onJumpToChapter?.(1)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            HOW IT WORKS
          </button>
          <Link
            to="/demo"
            className="hover:text-white transition-colors cursor-pointer"
          >
            DEMO
          </Link>
          <Link
            to="/audit"
            className="hover:text-white transition-colors cursor-pointer"
          >
            AUDIT LOG
          </Link>
          <Link
            to="/metrics"
            className="hover:text-white transition-colors cursor-pointer"
          >
            METRICS
          </Link>
          <Link
            to="/dataset"
            className="hover:text-white transition-colors cursor-pointer"
          >
            DATASET
          </Link>
        </nav>

        {/* Dark Chamfered Button: LIVE DEMO */}
        <Link to="/demo" className="hidden sm:inline-flex">
          <button className="clip-chamfer relative flex items-center gap-2 px-4 py-2 border border-[#37d3fc]/30 hover:border-[#37d3fc] bg-[#050a1c]/80 backdrop-blur-md text-[11px] font-ui tracking-[0.14em] uppercase text-[#d5ddfd] hover:text-white transition-all cursor-pointer">
            {/* Pixel chevron icon */}
            <svg
              viewBox="0 0 8 8"
              className="w-2 h-2 text-[#37d3fc] fill-current"
            >
              <rect x="0" y="0" width="2" height="2" />
              <rect x="2" y="2" width="2" height="2" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="2" y="6" width="2" height="2" />
            </svg>
            <span>LIVE DEMO</span>
          </button>
        </Link>

        {/* Lavender Chamfered Button: MENU (with 2x2 dot icon) */}
        <button
          onClick={onOpenMenu}
          aria-label="Open Fullscreen Menu"
          className="clip-chamfer-pill flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-[#d5ddfd] hover:bg-white text-[#050a1c] font-ui text-xs font-bold tracking-[0.16em] uppercase shadow-[0_0_20px_rgba(213,221,253,0.3)] transition-all cursor-pointer"
        >
          {/* 2x2 dot icon */}
          <div className="grid grid-cols-2 gap-1 w-3 h-3">
            <span className="w-1 h-1 bg-[#050a1c] rounded-none" />
            <span className="w-1 h-1 bg-[#050a1c] rounded-none" />
            <span className="w-1 h-1 bg-[#050a1c] rounded-none" />
            <span className="w-1 h-1 bg-[#050a1c] rounded-none" />
          </div>
          <span>MENU</span>
        </button>
      </div>
    </header>
  );
};

export default CinematicHeader;