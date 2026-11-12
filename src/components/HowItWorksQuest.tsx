import React, { useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  ScanEye,
  Lock,
  Send,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';

interface QuestStage {
  step: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badgeText: string;
  colorBorder: string;
  colorIcon: string;
  colorBg: string;
  glowClass: string;
  activeBorder: string;
}

const STAGES: QuestStage[] = [
  {
    step: 'STAGE 01',
    name: 'Detect',
    subtitle: 'Perimeter Deep Inspection',
    description:
      'Heuristic scanner identifies Aadhaar, PAN, GSTIN, passports, and Indian personal identifiers at the perimeter before payload dispatch.',
    icon: ScanEye,
    badgeText: 'Stage 1 Intercept',
    colorBorder: 'border-saffron/40',
    colorIcon: 'text-saffron',
    colorBg: 'bg-saffron/15',
    glowClass: 'shadow-saffron-glow',
    activeBorder: 'border-saffron shadow-saffron-glow',
  },
  {
    step: 'STAGE 02',
    name: 'Mask',
    subtitle: 'On-Premises Tokenization',
    description:
      'Substitutes raw sensitive data with deterministic placeholders like <AADHAAR_1> and isolates original values in local storage.',
    icon: Lock,
    badgeText: 'Stage 2 Tokenize',
    colorBorder: 'border-neon/40',
    colorIcon: 'text-neon',
    colorBg: 'bg-neon/15',
    glowClass: 'shadow-neon-glow',
    activeBorder: 'border-neon shadow-neon-glow',
  },
  {
    step: 'STAGE 03',
    name: 'Forward',
    subtitle: 'Zero-Leak Cloud Dispatch',
    description:
      'Dispatches the fully anonymized prompt to frontier LLMs (OpenAI, Gemini, Anthropic) with zero raw PII crossing cloud boundaries.',
    icon: Send,
    badgeText: 'Stage 3 Egress',
    colorBorder: 'border-cyan-400/40',
    colorIcon: 'text-cyan-400',
    colorBg: 'bg-cyan-400/15',
    glowClass: 'shadow-cyan-glow',
    activeBorder: 'border-cyan-400 shadow-md',
  },
  {
    step: 'STAGE 04',
    name: 'Reinsert',
    subtitle: 'Local Client Restoration',
    description:
      'Intercepts streamed LLM output at the perimeter, replacing placeholder chips back to original citizen values seamlessly on-premise.',
    icon: ShieldCheck,
    badgeText: 'Stage 4 Ingress',
    colorBorder: 'border-indiaGreen/40',
    colorIcon: 'text-indiaGreen',
    colorBg: 'bg-indiaGreen/15',
    glowClass: 'shadow-green-glow',
    activeBorder: 'border-indiaGreen shadow-green-glow',
  },
];

export const HowItWorksQuest: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopLineRef = useRef<HTMLDivElement>(null);
  const mobileLineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (shouldReduceMotion) return;

      const mm = gsap.matchMedia();

      // Desktop: horizontal line draw with scroll scrub
      mm.add('(min-width: 1024px)', () => {
        if (!desktopLineRef.current || !trackRef.current) return;

        gsap.fromTo(
          desktopLineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: trackRef.current,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 0.6,
            },
          }
        );
      });

      // Mobile/Tablet: vertical line draw with scroll scrub
      mm.add('(max-width: 1023px)', () => {
        if (!mobileLineRef.current || !trackRef.current) return;

        gsap.fromTo(
          mobileLineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: trackRef.current,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 0.6,
            },
          }
        );
      });

      // Light up each of the 4 nodes as the connector line passes it
      nodeRefs.current.forEach((node, idx) => {
        if (!node) return;

        gsap.fromTo(
          node,
          {
            opacity: 0.45,
            scale: 0.94,
            filter: 'grayscale(0.6)',
          },
          {
            opacity: 1,
            scale: 1,
            filter: 'grayscale(0)',
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              end: 'bottom 35%',
              toggleActions: 'play reverse play reverse',
              onEnter: () => {
                node.classList.add('node-active');
              },
              onLeaveBack: () => {
                node.classList.remove('node-active');
              },
            },
          }
        );
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [shouldReduceMotion] }
  );

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 sm:py-28 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF] overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 security-grid opacity-30 dark:opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Badge
            variant="outline"
            className="border-indiaGreen/50 text-indiaGreen font-mono text-xs mb-3"
          >
            <Compass className="w-3.5 h-3.5 mr-1" /> ARCHITECTURE QUEST PATH
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            How It Works: The 4 Privacy Gates
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
            A battle-tested zero-trust pipeline that guarantees full DPDP Act compliance
            without sacrificing enterprise LLM intelligence or reasoning capabilities.
          </p>
        </div>

        {/* Quest Path Track */}
        <div ref={trackRef} className="relative">
          {/* Connecting Track Line for Desktop (Background muted track) */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-12 bg-border/40 z-0" />
          {/* Active Animated Connector Line for Desktop */}
          <div
            ref={desktopLineRef}
            className={`hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-12 bg-gradient-to-r from-saffron via-neon to-indiaGreen z-0 shadow-sm ${
              shouldReduceMotion ? 'scale-x-100' : 'scale-x-0'
            }`}
          />

          {/* Connecting Track Line for Mobile / Tablet (Background muted track) */}
          <div className="lg:hidden absolute top-8 bottom-8 left-8 sm:left-10 w-1 bg-border/40 z-0" />
          {/* Active Animated Connector Line for Mobile */}
          <div
            ref={mobileLineRef}
            className={`lg:hidden absolute top-8 bottom-8 left-8 sm:left-10 w-1 bg-gradient-to-b from-saffron via-neon to-indiaGreen z-0 shadow-sm ${
              shouldReduceMotion ? 'scale-y-100' : 'scale-y-0'
            }`}
          />

          {/* 4 Connected Quest Nodes */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <div
                  key={stage.name}
                  ref={(el) => {
                    nodeRefs.current[index] = el;
                  }}
                  className={`quest-node flex flex-row lg:flex-col items-start gap-4 sm:gap-5 rounded-3xl border ${stage.colorBorder} bg-card/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 group hover:border-foreground/40`}
                >
                  {/* Node Icon Avatar with Level Ring */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border ${stage.colorBorder} ${stage.colorBg} ${stage.glowClass} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${stage.colorIcon}`} />
                    </div>

                    {/* Step Number Dot */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border text-[10px] font-mono font-bold flex items-center justify-center text-foreground shadow-md">
                      0{index + 1}
                    </div>
                  </div>

                  {/* Stage Text & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                        {stage.step}
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-[10px] font-mono text-neon font-semibold">
                        {stage.badgeText}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                      {stage.name}
                    </h3>
                    <p className="text-xs font-semibold text-foreground/80 mt-0.5">
                      {stage.subtitle}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksQuest;
