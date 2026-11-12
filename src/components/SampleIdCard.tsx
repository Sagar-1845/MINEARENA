import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Shield, Fingerprint, Cpu, Sparkles, Lock, QrCode, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SampleCardProps {
  type: 'aadhaar' | 'pan';
  isMaskedForce?: boolean;
  className?: string;
  onHoverChange?: (isHovered: boolean) => void;
}

export const SampleIdCard: React.FC<SampleCardProps> = ({
  type,
  isMaskedForce = false,
  className,
  onHoverChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Combine parent force, hover, or touch trigger
  const isMasked = isMaskedForce || isHovered || isTouched;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const handleToggleTouch = () => {
    setIsTouched((prev) => !prev);
  };

  if (type === 'aadhaar') {
    return (
      <motion.div
        className={cn(
          'relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] select-none cursor-pointer',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleTouch}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, rotateZ: -2 }}
        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotateZ: -2 }}
        viewport={{ once: false, amount: 0.3 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.03, rotateZ: 0, y: -6, zIndex: 30 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Ambient Backlight Glow */}
        <div
          className={cn(
            'absolute -inset-1 rounded-2xl opacity-40 blur-xl transition-all duration-500',
            isMasked
              ? 'bg-gradient-to-r from-neon/40 via-saffron/30 to-indiaGreen/30 opacity-75'
              : 'bg-gradient-to-r from-saffron/30 via-border/20 to-indiaGreen/20'
          )}
        />

        {/* Card Frame */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Subtle Security Guilloche Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Tri-color Top Accent Ribbon (Subtle nod to India) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-saffron" />
            <div className="flex-1 bg-white/70" />
            <div className="flex-1 bg-indiaGreen" />
          </div>

          {/* Prominent Diagonal SAMPLE Watermark */}
          <div className="absolute -right-12 top-6 rotate-45 pointer-events-none z-10">
            <div className="bg-destructive/20 border-y border-destructive/50 text-destructive text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.25em] px-12 py-0.5 shadow-sm">
              SAMPLE ONLY
            </div>
          </div>

          {/* Card Header (NO govt emblems - strictly stylized sample indicator) */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/15 text-saffron border border-saffron/30">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/90">
                  Resident Specimen Card
                </p>
                <p className="text-[9px] font-mono text-muted-foreground">
                  DPDP Test Fixture • Synthetic
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-border/70 text-[9px] font-mono text-muted-foreground mr-8 sm:mr-0">
              NON-OFFICIAL
            </Badge>
          </div>

          {/* Card Body with Photo Placeholder & Details */}
          <div className="mt-3.5 flex items-start gap-3.5 sm:gap-4">
            {/* Synthetic Photo Box */}
            <div className="relative flex-shrink-0 w-14 h-18 sm:w-18 sm:h-22 rounded-lg border border-border bg-muted/40 overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <Fingerprint className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/40 mb-1" />
              <div className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-muted-foreground/80 z-10">
                FICTIONAL
              </div>
              <div className="absolute bottom-1 w-full text-center">
                <span className="text-[6px] sm:text-[7px] text-muted-foreground/60 font-mono">SPECIMEN</span>
              </div>
            </div>

            {/* Fictional Citizen Profile */}
            <div className="flex-1 min-w-0 space-y-1.5 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                  Name / नाम
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">
                  Aarav Sharma
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">
                    DOB / जन्म
                  </span>
                  <span className="font-mono text-foreground/85">14/08/1992</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">
                    Gender / लिंग
                  </span>
                  <span className="font-mono text-foreground/85">MALE / पुरुष</span>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                <Shield className="h-3 w-3 text-indiaGreen" />
                <span>Synthetic Enclave Sandbox</span>
              </div>
            </div>
          </div>

          {/* Masked ID / Animated Token Area */}
          <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-2.5 sm:p-3 text-center transition-all">
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono mb-1.5 px-0.5">
              <span>IDENTIFIER VALUE</span>
              <span className="flex items-center gap-1">
                {isMasked ? (
                  <span className="text-neon flex items-center gap-1 font-semibold">
                    <Sparkles className="h-2.5 w-2.5 animate-spin" /> MASKED TO LLM
                  </span>
                ) : (
                  <span className="text-muted-foreground">HOVER TO MASK</span>
                )}
              </span>
            </div>

            <div className="relative min-h-[38px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {!isMasked ? (
                  <motion.div
                    key="unmasked-aadhaar"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-sm sm:text-base font-bold tracking-widest text-foreground/90 flex items-center gap-2"
                  >
                    <span>4932</span>
                    <span>8109</span>
                    <span>2384</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="masked-aadhaar"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -8 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="token-badge px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-bold shadow-neon-glow"
                  >
                    <Lock className="h-3.5 w-3.5 text-neon" />
                    <span>&lt;AADHAAR_1&gt;</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neon/20 text-neon font-normal">
                      Vault Token
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[8px] sm:text-[9px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-indiaGreen" /> DPDP Sec. 8(5) Guarded
            </span>
            <span>NO GOVT EMBLEM • SAMPLE</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // PAN CARD SPECIMEN
  return (
    <motion.div
      className={cn(
        'relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] select-none cursor-pointer',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggleTouch}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, rotateZ: 2 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotateZ: 2 }}
      viewport={{ once: false, amount: 0.3 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.03, rotateZ: 0, y: -6, zIndex: 30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient Glow */}
      <div
        className={cn(
          'absolute -inset-1 rounded-2xl opacity-40 blur-xl transition-all duration-500',
          isMasked
            ? 'bg-gradient-to-r from-neon/40 via-cyan-500/20 to-indiaGreen/30 opacity-75'
            : 'bg-gradient-to-r from-cyan-900/30 via-slate-800/20 to-indiaGreen/20'
        )}
      />

      {/* Card Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Subtle Guilloche & Micro-print */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        {/* Top Metallic Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-600 via-indiaGreen to-saffron" />

        {/* Diagonal SAMPLE Watermark */}
        <div className="absolute -right-12 top-6 rotate-45 pointer-events-none z-10">
          <div className="bg-destructive/20 border-y border-destructive/50 text-destructive text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.25em] px-12 py-0.5 shadow-sm">
            SAMPLE ONLY
          </div>
        </div>

        {/* Header (NO govt emblems - strictly stylized sample indicator) */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/90">
                Tax Identifier Specimen
              </p>
              <p className="text-[9px] font-mono text-muted-foreground">
                Financial Entity Sample Card
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-border/70 text-[9px] font-mono text-muted-foreground mr-8 sm:mr-0">
            NON-OFFICIAL
          </Badge>
        </div>

        {/* Card Body */}
        <div className="mt-3.5 flex items-start gap-3.5 sm:gap-4">
          {/* Holographic Chip & Synthetic Photo */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Stylized EMV Microchip graphic */}
            <div className="w-10 h-7 rounded border border-amber-500/50 bg-gradient-to-br from-amber-200/20 to-amber-500/30 p-1 flex items-center justify-center">
              <div className="w-full h-full border border-amber-400/40 rounded-[2px] flex items-center justify-center">
                <div className="w-1.5 h-full bg-amber-400/30 mx-auto" />
              </div>
            </div>

            {/* Synthetic Photo Box */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg border border-border bg-muted/40 overflow-hidden flex flex-col items-center justify-center text-center p-1">
              <span className="text-[6px] sm:text-[7px] font-mono text-muted-foreground uppercase leading-tight">
                SYNTHETIC HOLDER
              </span>
              <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50 mt-0.5" />
            </div>
          </div>

          {/* Fictional Details */}
          <div className="flex-1 min-w-0 space-y-1.5 text-left">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">
                Name / कार्डधारक का नाम
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">
                Priya Venkatesh
              </p>
            </div>

            <div>
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">
                Parent / पिता का नाम
              </span>
              <p className="text-[11px] font-medium text-foreground/80 truncate">
                R. Venkatesh
              </p>
            </div>

            <div className="text-[10px] sm:text-[11px]">
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground block">
                Date of Birth / जन्म तिथि
              </span>
              <span className="font-mono text-foreground/85">03/11/1988</span>
            </div>
          </div>
        </div>

        {/* Masked PAN / Animated Token Area */}
        <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-2.5 sm:p-3 text-center transition-all">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono mb-1.5 px-0.5">
            <span>PERMANENT ACCOUNT NUMBER</span>
            <span className="flex items-center gap-1">
              {isMasked ? (
                <span className="text-neon flex items-center gap-1 font-semibold">
                  <Sparkles className="h-2.5 w-2.5 animate-spin" /> MASKED TO LLM
                </span>
              ) : (
                <span className="text-muted-foreground">HOVER TO MASK</span>
              )}
            </span>
          </div>

          <div className="relative min-h-[38px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {!isMasked ? (
                <motion.div
                  key="unmasked-pan"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-sm sm:text-base font-bold tracking-widest text-foreground/90 flex items-center gap-1"
                >
                  <span className="text-foreground/90">ABCDE1234F</span>
                </motion.div>
              ) : (
                <motion.div
                  key="masked-pan"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -8 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="token-badge px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-bold shadow-neon-glow"
                >
                  <Lock className="h-3.5 w-3.5 text-neon" />
                  <span>&lt;PAN_1&gt;</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neon/20 text-neon font-normal">
                    Vault Token
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[8px] sm:text-[9px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 text-indiaGreen" /> DPDP Financial PII Isolation
          </span>
          <span>NO GOVT EMBLEM • SAMPLE</span>
        </div>
      </div>
    </motion.div>
  );
};
