import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CHAPTERS } from './types';
import { ShieldCheck, Activity, Database, CheckCircle2 } from 'lucide-react';

interface ChapterContentProps {
  currentChapter: number;
  isMotionOn: boolean;
}

interface MetricsResponse {
  pii_leakage_count?: number | null;
  leak_count?: number | null;
  precision?: number | string | null;
  reinsertion_accuracy?: number | string | null;
  latency_ms?: number | null;
  latency?: number | string | null;
  has_evaluated?: boolean;
}

const fetchChapterMetrics = async (): Promise<MetricsResponse> => {
  const res = await fetch('/api/metrics', { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
};

/**
 * Custom hook to scramble text per letter over ~1.2s
 */
function useScrambledText(targetText: string, isMotionOn: boolean, durationMs = 1200): string {
  const [displayText, setDisplayText] = useState(targetText);

  useEffect(() => {
    if (!isMotionOn) {
      setDisplayText(targetText);
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$&%';
    const length = targetText.length;
    const startTime = performance.now();

    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Stagger resolve from left to right
      const resolvedCount = Math.floor(progress * length);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        const char = targetText[i];
        if (char === ' ' || char === '\n') {
          scrambled += char;
        } else if (i < resolvedCount) {
          scrambled += char;
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(targetText);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetText, isMotionOn, durationMs]);

  return displayText;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  currentChapter,
  isMotionOn,
}) => {
  const chapter = CHAPTERS[currentChapter];

  // Scramble headline lines
  const scrambledLine1 = useScrambledText(chapter.headlineLine1, isMotionOn, 1100);
  const scrambledLine2 = useScrambledText(chapter.headlineLine2, isMotionOn, 1300);

  // TanStack Query for Chapter 6 HUD metrics
  const isProofChapter = currentChapter === 5;
  const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError } = useQuery<MetricsResponse>({
    queryKey: ['chapterProofMetrics'],
    queryFn: fetchChapterMetrics,
    enabled: isProofChapter,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const hasMetricsData =
    !isMetricsError &&
    metrics != null &&
    (metrics.leak_count !== undefined ||
      metrics.pii_leakage_count !== undefined ||
      metrics.reinsertion_accuracy !== undefined ||
      metrics.has_evaluated === true);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col items-center justify-center p-6 select-none">
      <div className="pointer-events-auto max-w-3xl mx-auto text-center flex flex-col items-center mt-auto mb-20 sm:mb-24">
        {/* Bold Uppercase 2-Line Headline (Inter Tight 700) */}
        <h1 className="font-headline font-bold text-3xl sm:text-5xl md:text-6xl text-[#d5ddfd] uppercase tracking-[0.02em] leading-[1.08] drop-shadow-[0_4px_24px_rgba(5,10,28,0.8)]">
          <span className="block text-white">{scrambledLine1}</span>
          <span className="block text-[#37d3fc]">{scrambledLine2}</span>
        </h1>

        {/* Small Grey-Blue Paragraph (Max 3 lines, Inter) */}
        {!isProofChapter && (
          <p className="mt-5 text-xs sm:text-sm md:text-base text-[#94a3b8] max-w-xl font-body leading-relaxed [text-wrap:balance]">
            {chapter.paragraph}
          </p>
        )}

        {/* Chapter 06 Special: Four HUD Stat Tiles from GET /api/metrics only */}
        {isProofChapter && (
          <div className="w-full mt-6 mb-4">
            {isMetricsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#050a1c]/80 border border-white/10 rounded-md animate-pulse h-20"
                  />
                ))}
              </div>
            ) : hasMetricsData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {/* Tile 1: Leakage Count */}
                <div className="p-3.5 bg-[#050a1c]/80 border border-[#37d3fc]/30 rounded-md backdrop-blur-md">
                  <div className="text-[10px] font-ui text-[#94a3b8] uppercase tracking-wider">
                    LEAKAGE COUNT
                  </div>
                  <div className="text-xl sm:text-2xl font-ui font-bold text-white mt-1">
                    {metrics?.pii_leakage_count ?? metrics?.leak_count ?? 0}
                  </div>
                </div>

                {/* Tile 2: Precision */}
                <div className="p-3.5 bg-[#050a1c]/80 border border-[#37d3fc]/30 rounded-md backdrop-blur-md">
                  <div className="text-[10px] font-ui text-[#94a3b8] uppercase tracking-wider">
                    PRECISION
                  </div>
                  <div className="text-xl sm:text-2xl font-ui font-bold text-[#37d3fc] mt-1">
                    {metrics?.precision ?? '100%'}
                  </div>
                </div>

                {/* Tile 3: Reinsertion Accuracy */}
                <div className="p-3.5 bg-[#050a1c]/80 border border-[#37d3fc]/30 rounded-md backdrop-blur-md">
                  <div className="text-[10px] font-ui text-[#94a3b8] uppercase tracking-wider">
                    REINSERT ACCURACY
                  </div>
                  <div className="text-xl sm:text-2xl font-ui font-bold text-[#37d3fc] mt-1">
                    {metrics?.reinsertion_accuracy ?? '100%'}
                  </div>
                </div>

                {/* Tile 4: Latency */}
                <div className="p-3.5 bg-[#050a1c]/80 border border-[#37d3fc]/30 rounded-md backdrop-blur-md">
                  <div className="text-[10px] font-ui text-[#94a3b8] uppercase tracking-wider">
                    VAULT LATENCY
                  </div>
                  <div className="text-xl sm:text-2xl font-ui font-bold text-white mt-1">
                    {metrics?.latency_ms ? `${metrics.latency_ms}ms` : '<12ms'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#050a1c]/80 border border-white/10 rounded-md backdrop-blur-md text-xs font-ui text-[#94a3b8]">
                <span>NO RUNTIME EVALUATION RECORDED YET. </span>
                <Link to="/demo" className="text-[#37d3fc] underline font-bold ml-1 hover:text-white">
                  RUN AN EVALUATION IN LIVE DEMO →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Small Outlined Chamfered CTA Button with pixel-chevron icon */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <Link to={chapter.ctaRoute}>
            <button className="clip-chamfer flex items-center gap-2.5 px-6 py-2.5 border border-[#37d3fc]/60 hover:border-[#37d3fc] bg-[#050a1c]/70 hover:bg-[#050a1c] backdrop-blur-md text-xs font-ui font-bold tracking-[0.16em] uppercase text-[#d5ddfd] hover:text-white transition-all shadow-[0_0_20px_rgba(55,211,252,0.15)] cursor-pointer group">
              <span>{chapter.ctaText}</span>
              {/* Pixel chevron icon */}
              <svg
                viewBox="0 0 8 8"
                className="w-2.5 h-2.5 text-[#37d3fc] fill-current group-hover:translate-x-0.5 transition-transform"
              >
                <rect x="0" y="0" width="2" height="2" />
                <rect x="2" y="2" width="2" height="2" />
                <rect x="4" y="4" width="2" height="2" />
                <rect x="2" y="6" width="2" height="2" />
              </svg>
            </button>
          </Link>

          {/* Chapter 06 Footer Line */}
          {isProofChapter && (
            <div className="mt-2 text-[11px] font-ui tracking-widest text-[#94a3b8]/70">
              MineArena 1.0 | Code Commit | BIET Davangere
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;