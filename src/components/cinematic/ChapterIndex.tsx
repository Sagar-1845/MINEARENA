import React from 'react';
import { CHAPTERS } from './types';

interface ChapterIndexProps {
  currentChapter: number;
  onSelectChapter: (index: number) => void;
}

export const ChapterIndex: React.FC<ChapterIndexProps> = ({
  currentChapter,
  onSelectChapter,
}) => {
  return (
    <aside
      aria-label="Chapter Navigation"
      className="fixed left-6 sm:left-10 md:left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-5 text-[11px] font-ui tracking-[0.18em] uppercase select-none pointer-events-auto"
    >
      {CHAPTERS.map((ch) => {
        const isActive = ch.index === currentChapter;
        return (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.index)}
            aria-current={isActive ? 'step' : undefined}
            className={`flex items-center gap-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#37d3fc] cursor-pointer ${
              isActive
                ? 'text-[#37d3fc] font-bold opacity-100 scale-105'
                : 'text-[#d5ddfd] opacity-35 hover:opacity-80'
            }`}
          >
            {/* Square Bullet for Active Item */}
            {isActive ? (
              <span className="w-1.5 h-1.5 bg-[#37d3fc] shadow-[0_0_8px_#37d3fc]" />
            ) : (
              <span className="w-1 h-1 bg-[#d5ddfd]/40" />
            )}
            <span>{ch.navLabel}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default ChapterIndex;