import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Lock, Play, Pause, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const BeforeAfterCompactDemo: React.FC = () => {
  const [isMasked, setIsMasked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Slow loop: toggles every 3.5 seconds unless paused or reduced motion
  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;
    const interval = setInterval(() => {
      setIsMasked((prev) => !prev);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, shouldReduceMotion]);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleToggleState = () => {
    setIsMasked((prev) => !prev);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 sm:mt-10">
      <div className="rounded-2xl border border-border/90 bg-card/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden">
        {/* Subtle Top Strip */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 transition-colors duration-500',
            isMasked ? 'bg-neon' : 'bg-saffron'
          )}
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Live Gateway Transformation:
            </span>
            <Badge
              variant={isMasked ? 'neon' : 'saffron'}
              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5"
            >
              {isMasked ? 'Masked Outbound' : 'Raw Client Input'}
            </Badge>
          </div>

          {/* Action & Pause Buttons (min 44px tap targets for mobile accessibility) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleState}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-muted-foreground hover:text-foreground border border-border/70 hover:border-foreground/30 min-h-[44px] inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              Toggle
            </button>

            <button
              type="button"
              onClick={handleTogglePause}
              aria-label={isPaused ? 'Resume token animation' : 'Pause token animation'}
              title={isPaused ? 'Resume animation' : 'Pause animation'}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-border/70 bg-secondary/50 text-foreground hover:text-neon hover:border-neon flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Animated Sentence Body */}
        <div className="min-h-[58px] sm:min-h-[50px] flex items-center text-xs sm:text-sm font-mono leading-relaxed text-foreground/90">
          <AnimatePresence mode="wait">
            {!isMasked ? (
              <motion.p
                key="raw-sentence"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="w-full text-left"
              >
                Verify KYC for customer{' '}
                <span className="inline-block px-1.5 py-0.5 rounded bg-saffron/20 border border-saffron/50 text-saffron font-bold">
                  Rahul Sharma
                </span>{' '}
                with tax identifier{' '}
                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold">
                  ABCDE1234F
                </span>
                .
              </motion.p>
            ) : (
              <motion.p
                key="masked-sentence"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="w-full text-left"
              >
                Verify KYC for customer{' '}
                <span className="token-badge px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs font-bold shadow-neon-glow">
                  <Lock className="w-3 h-3 text-neon" />
                  &lt;PERSON_1&gt;
                </span>{' '}
                with tax identifier{' '}
                <span className="token-badge px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs font-bold shadow-neon-glow">
                  <Lock className="w-3 h-3 text-neon" />
                  &lt;PAN_1&gt;
                </span>
                .
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Explanatory Caption */}
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-neon" />
            <span>Fictional sample specimen • Zero cloud PII</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
            {isPaused ? 'Animation Paused' : 'Auto-Looping'}
          </span>
        </div>
      </div>
    </div>
  );
};
