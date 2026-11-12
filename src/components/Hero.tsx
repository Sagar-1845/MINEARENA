import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SampleIdCard } from '@/components/SampleIdCard';

export const Hero: React.FC = () => {
  const [forceMasked, setForceMasked] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Ambient Cyber-Security Mesh & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Security Matrix Grid */}
        <div className="absolute inset-0 security-grid opacity-60 dark:opacity-40" />

        {/* Top Radial Saffron Glow (North-West) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-saffron/15 blur-[120px] dark:bg-saffron/10" />

        {/* Top Radial Green Glow (North-East) */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indiaGreen/15 blur-[120px] dark:bg-indiaGreen/10" />

        {/* Center Neon Cyan Core Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-neon/10 blur-[140px] dark:bg-neon/12 pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Compliance Eyebrow */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-md shadow-sm">
            {/* Tricolor Mini Bar */}
            <div className="flex h-2.5 w-5 rounded-sm overflow-hidden border border-border/40">
              <span className="flex-1 bg-saffron" />
              <span className="flex-1 bg-white" />
              <span className="flex-1 bg-indiaGreen" />
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-medium text-foreground/90">
              DPDP ACT 2023 COMPLIANT GATEWAY
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon shadow-neon-glow" />
          </div>

          <Badge variant="saffron" className="text-[10px] font-mono uppercase tracking-wider">
            Zero Cloud Leakage
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <motion.h1
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]"
          >
            <span>Detect the sensitive.</span>{' '}
            <span className="block sm:inline saffron-gradient-text">
              Mask the personal.
            </span>{' '}
            <span className="block mt-1 sm:mt-0 text-foreground">
              Restore locally.
            </span>
          </motion.h1>

          {/* Value Prop Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed px-2"
          >
            A high-throughput privacy proxy sitting between your enterprise AI apps
            and public LLMs. Sensitive identifiers like Aadhaar, PAN, and phone
            numbers are intercepted, tokenized into deterministic chips, and restored on-premise.
          </motion.p>

          {/* CTA Buttons & Interactive Controls */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Button
              variant="saffron"
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm sm:text-base font-semibold shadow-saffron-glow"
              onClick={() => {
                const el = document.getElementById('pipeline-demo');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore Architecture</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm sm:text-base font-mono border-neon/30 text-foreground hover:border-neon hover:text-neon"
              onClick={() => setForceMasked((prev) => !prev)}
            >
              {forceMasked ? (
                <>
                  <Eye className="h-4 w-4 text-saffron" />
                  <span>Show Raw PII</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-neon" />
                  <span>Simulate Masking</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Floating Stylized SAMPLE ID Cards Showcase Stage */}
        <div className="mt-12 sm:mt-16 md:mt-20 max-w-5xl mx-auto">
          {/* Stage Instructions & Status Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 px-2 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-neon animate-ping" />
              <span className="text-foreground/80 font-medium">
                Live Tokenizer Stage:
              </span>
              <span>
                {forceMasked
                  ? 'All Identifiers Masked with High-Entropy Chips'
                  : 'Hover over or tap any card to trigger tokenization'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Tokens:</span>
              <span className="token-badge px-2 py-0.5 rounded text-[10px]">
                &lt;AADHAAR_1&gt;
              </span>
              <span className="token-badge px-2 py-0.5 rounded text-[10px]">
                &lt;PAN_1&gt;
              </span>
            </div>
          </div>

          {/* Cards Floating Canvas */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 p-3 sm:p-6 md:p-10 rounded-3xl border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden min-h-[460px] sm:min-h-[480px]">
            {/* Background Cyber Laser Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-neon to-transparent animate-scanline" />
            </div>

            {/* Floating Card 1: Sample Aadhaar Style Specimen */}
            <motion.div
              className="relative z-10 w-full flex justify-center"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, -10, 0],
                      transition: {
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }
              }
            >
              <SampleIdCard
                type="aadhaar"
                isMaskedForce={forceMasked}
                onHoverChange={(hovered) =>
                  setHoveredCard(hovered ? 'aadhaar' : null)
                }
              />
            </motion.div>

            {/* Center Transformation Indicator (Visible on medium+ screens) */}
            <div className="hidden lg:flex flex-col items-center justify-center text-muted-foreground z-20">
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: forceMasked ? [1, 1.15, 1] : 1,
                        rotate: forceMasked ? 180 : 0,
                      }
                }
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full border border-border bg-card/90 shadow-xl flex items-center justify-center text-neon"
              >
                <Zap className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] font-mono uppercase mt-2 tracking-widest text-muted-foreground">
                Zero Leak
              </span>
            </div>

            {/* Floating Card 2: Sample PAN Style Specimen */}
            <motion.div
              className="relative z-10 w-full flex justify-center"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [-8, 4, -8],
                      transition: {
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      },
                    }
              }
            >
              <SampleIdCard
                type="pan"
                isMaskedForce={forceMasked}
                onHoverChange={(hovered) =>
                  setHoveredCard(hovered ? 'pan' : null)
                }
              />
            </motion.div>
          </div>

          {/* Bottom Stage Callouts */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-indiaGreen" />
                <span>Deterministic Mapping</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Every identifier receives a constant pseudonym token per tenant session.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-foreground">
                <Lock className="h-4 w-4 text-neon" />
                <span>On-Premises Token Vault</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Real identities never cross your security boundary or reach third-party LLMs.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-saffron" />
                <span>Local Restoration</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Responses seamlessly unmask back to original PII on the client side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
