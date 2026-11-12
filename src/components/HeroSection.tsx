import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import {
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Layers,
  Lock,
  Terminal,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotatingTagRing } from '@/components/RotatingTagRing';
import { BeforeAfterCompactDemo } from '@/components/BeforeAfterCompactDemo';
import { PrivacyOrbContainer } from '@/components/3d/PrivacyOrbContainer';

export interface HeroMetrics {
  leakage_count?: number | null;
  pii_leakage_count?: number | null;
  leak_count?: number | null;
  reinsertion_accuracy?: number | string | null;
  has_evaluated?: boolean;
}

const fetchHeroMetrics = async (): Promise<HeroMetrics> => {
  const res = await fetch('/api/metrics', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
};

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // GSAP SplitText line reveal: colored lines staggering in, skipped if reduced motion
  useGSAP(
    () => {
      if (shouldReduceMotion || !headlineRef.current) return;

      const split = new SplitText(headlineRef.current, {
        type: 'lines',
        linesClass: 'split-headline-line overflow-hidden',
      });

      gsap.from(split.lines, {
        yPercent: 100,
        opacity: 0,
        duration: 0.85,
        stagger: 0.16,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      return () => {
        split.revert();
      };
    },
    { scope: headlineRef, dependencies: [shouldReduceMotion] }
  );

  // Query live metrics from GET /api/metrics for the bottom strip
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useQuery<HeroMetrics>({
    queryKey: ['heroTelemetryMetrics'],
    queryFn: fetchHeroMetrics,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleScrollToCards = () => {
    const el = document.getElementById('card-stage');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Derive exact metric values if returned by API
  const leakageCount =
    metrics?.leakage_count ?? metrics?.pii_leakage_count ?? metrics?.leak_count;
  const reinsertionAccuracy = metrics?.reinsertion_accuracy;

  const hasMetricsData =
    !metricsError &&
    metrics != null &&
    (leakageCount !== undefined && leakageCount !== null ||
      reinsertionAccuracy !== undefined && reinsertionAccuracy !== null);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 sm:py-28 overflow-hidden">
      {/* Background Cyber Mesh & Soft Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 security-grid opacity-35 dark:opacity-20" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[450px] rounded-full bg-gradient-to-tr from-saffron/20 via-neon/15 to-indiaGreen/20 blur-[120px] pointer-events-none" />
      </div>

      {/* Rotating Ring of Placeholder Tags (Behind all content, max opacity 0.25, pointer-events none) */}
      <RotatingTagRing />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl text-center">
        {/* Status Eyebrow Badge */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/90 bg-card/95 backdrop-blur-md shadow-lg mb-6 sm:mb-8"
        >
          {/* Subtle Tricolor Notch */}
          <div className="flex h-3 w-6 rounded-sm overflow-hidden border border-border/50">
            <span className="flex-1 bg-saffron" />
            <span className="flex-1 bg-white/80" />
            <span className="flex-1 bg-indiaGreen" />
          </div>
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-foreground">
            DPDP ACT 2023 PRIVACY GATEWAY
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neon font-bold">
            <Lock className="w-3 h-3 text-neon" /> ZERO CLOUD LEAKAGE
          </span>
        </motion.div>

        {/* Big Confident Headline with SplitText Line Reveal */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.08] max-w-4xl mx-auto"
        >
          <span>Detect the sensitive.</span>{' '}
          <span className="saffron-gradient-text block sm:inline">
            Mask the personal.
          </span>{' '}
          <span className="block mt-1 sm:mt-0 text-foreground">
            Process securely.
          </span>{' '}
          <span className="text-indiaGreen block mt-1 sm:mt-0">
            Restore locally.
          </span>
        </h1>

        {/* High-Contrast Balanced Paragraph (WCAG AAA compliant, text-wrap: balance) */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-zinc-900 dark:text-zinc-50 max-w-3xl mx-auto font-medium leading-relaxed [text-wrap:balance]"
        >
          Detects Aadhaar, PAN, GSTIN, Voter ID and Passport numbers locally,
          sends only masked text to the LLM, and restores the real values on your side.
        </motion.p>

        {/* 3D Privacy Gateway Vault (gated by useCanRun3D with static fallback, ErrorBoundary, Suspense) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="my-6 sm:my-8 flex justify-center"
        >
          <PrivacyOrbContainer className="w-48 h-48 sm:w-56 sm:h-56" />
        </motion.div>

        {/* Call to Actions: Primary links to real /demo route, Secondary is clearly visible with min 44px tap target */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto"
        >
          {/* Primary CTA goes to real /demo route */}
          <Link to="/demo" className="w-full sm:w-auto">
            <Button
              variant="saffron"
              size="lg"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-bold shadow-saffron-glow rounded-xl gap-2 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-neon"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Gateway Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          {/* Secondary Button: clearly visible border, brighter text, visible focus ring, min 44px tap target */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleScrollToCards}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-bold rounded-xl gap-2 border-2 border-border/90 dark:border-slate-600 hover:border-neon dark:hover:border-neon text-foreground dark:text-white hover:text-neon dark:hover:text-neon bg-card/90 hover:bg-secondary/80 backdrop-blur-md shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Layers className="w-4 h-4 text-neon" />
            <span>Choose Your Document</span>
            <ChevronDown className="h-4 w-4 opacity-75" />
          </Button>
        </motion.div>

        {/* Compact Before/After Example under CTAs (Rahul Sharma -> <PERSON_1>, ABCDE1234F -> <PAN_1>) */}
        <BeforeAfterCompactDemo />

        {/* Bottom Strip: Populated ONLY from GET /api/metrics. Skeletons while loading; Hidden if no data. No hardcoded numbers. */}
        {metricsLoading && (
          <div className="mt-10 flex items-center justify-center gap-4 animate-pulse">
            <div className="h-8 w-36 rounded-full bg-secondary/80" />
            <div className="h-8 w-44 rounded-full bg-secondary/80" />
          </div>
        )}

        {!metricsLoading && hasMetricsData && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-muted-foreground"
          >
            {leakageCount !== undefined && leakageCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-indiaGreen" />
                <span className="text-foreground/80 font-medium">PII Leakage Count:</span>
                <span className="font-bold text-foreground font-mono">{leakageCount}</span>
              </div>
            )}

            {reinsertionAccuracy !== undefined && reinsertionAccuracy !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-sm">
                <Target className="w-3.5 h-3.5 text-saffron" />
                <span className="text-foreground/80 font-medium">Reinsertion Accuracy:</span>
                <span className="font-bold text-foreground font-mono">
                  {typeof reinsertionAccuracy === 'number' && reinsertionAccuracy <= 1
                    ? `${(reinsertionAccuracy * 100).toFixed(1)}%`
                    : `${reinsertionAccuracy}%`}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
