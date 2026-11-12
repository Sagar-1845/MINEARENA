import React, { useRef } from 'react';
import {
  Compass,
  Shield,
  Zap,
  Lock,
  Target,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { gsap, useGSAP } from '@/lib/gsap';

interface MetricItem {
  value: string;
  label: string;
  description: string;
}

const STATS: MetricItem[] = [
  {
    value: '45M+',
    label: 'Citizen Tokens Anonymized',
    description: 'Deterministic replacements processed across banking, healthcare, and civil records.',
  },
  {
    value: '100%',
    label: 'Reinsertion Accuracy',
    description: 'Lossless entity reconstruction on your side before application render.',
  },
  {
    value: '0',
    label: 'Raw PII Values to Cloud',
    description: 'Zero plaintext citizen data crosses VPC or external provider boundaries.',
  },
  {
    value: '<12ms',
    label: 'Micro-Vault Latency',
    description: 'High-throughput Rust/C++ regex & NER inference inside local perimeter.',
  },
];

export const PhilosophySection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion || !textBlockRef.current) return;

      gsap.from(textBlockRef.current.querySelectorAll('.ethos-paragraph'), {
        opacity: 0.25,
        y: 20,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: textBlockRef.current,
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: 0.5,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-24">
          <div>
            <Badge
              variant="outline"
              className="border-neon/40 text-neon font-mono text-xs mb-3"
            >
              <Compass className="w-3.5 h-3.5 mr-1" /> // BRAND ETHOS & PHILOSOPHY
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              We lead the way in <br />
              <span className="text-neon">sovereign intelligence.</span>
            </h2>
          </div>

          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest max-w-xs">
            TRANSFORMING SENSITIVE DATA PIPELINES INTO ZERO-LEAK PERIMETERS SINCE
            DPDP 2023.
          </div>
        </div>

        {/* Two-Column Editorial Narrative */}
        <div
          ref={textBlockRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 text-lg sm:text-xl font-medium leading-relaxed text-foreground/90 border-b border-border/40 pb-20"
        >
          <div className="ethos-paragraph space-y-6">
            <p>
              Just as landmark infrastructure defines a modern metropolis, sovereign
              privacy guarantees define the future of artificial intelligence.
              Enterprise foundation models require massive context, but Indian
              regulations strictly forbid personal data egress.
            </p>
            <p className="text-muted-foreground text-base sm:text-lg">
              ZeroLeak AI was architected from first principles to dissolve this
              compromise. We intercept prompts at the network boundary, swap
              every citizen identifier with cryptographically tied surrogates,
              and restore real values upon reply.
            </p>
          </div>

          <div className="ethos-paragraph space-y-6">
            <p>
              By decoupling intelligence from identity, your organization unlocks
              frontier models (OpenAI, Gemini, Claude) while maintaining 100%
              residency within your private sovereign enclave.
            </p>
            <div className="p-6 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-saffron font-bold uppercase">
                <Lock className="w-4 h-4 text-saffron" />
                <span>The Core ZeroLeak Axiom</span>
              </div>
              <p className="text-sm font-sans text-foreground/80 leading-relaxed">
                "What the cloud never receives, the cloud can never compromise."
              </p>
            </div>
          </div>
        </div>

        {/* 4 Architectural Enterprise Proof Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="p-6 sm:p-8 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-lg hover:border-neon/40 transition-all duration-300 group"
            >
              <div className="text-xs font-mono text-muted-foreground mb-4">
                0{i + 1} // METRIC
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono text-foreground tracking-tight group-hover:text-neon transition-colors">
                {stat.value}
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {stat.label}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
