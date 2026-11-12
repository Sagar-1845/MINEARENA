import React, { useState } from 'react';
import { Copy, Check, Palette, Sparkles, Layers, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TokenSpec {
  name: string;
  variable: string;
  hslDark: string;
  hslLight: string;
  hexDark: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const DESIGN_TOKENS: TokenSpec[] = [
  {
    name: 'Saffron (Tiranga Amber)',
    variable: '--saffron',
    hslDark: '28 96% 54%',
    hslLight: '28 95% 50%',
    hexDark: '#FF7F11',
    description: 'Primary sovereign CTA, security alerts, and primary branding.',
    bgClass: 'bg-saffron',
    borderClass: 'border-saffron',
    textClass: 'text-saffron',
  },
  {
    name: 'India Green (Emerald)',
    variable: '--india-green',
    hslDark: '142 72% 43%',
    hslLight: '142 75% 33%',
    hexDark: '#19A95C',
    description: 'Compliance verification, leak-check passed, safe enclave indicators.',
    bgClass: 'bg-indiaGreen',
    borderClass: 'border-indiaGreen',
    textClass: 'text-indiaGreen',
  },
  {
    name: 'Neon Cyber Token',
    variable: '--neon',
    hslDark: '168 100% 50%',
    hslLight: '168 100% 38%',
    hexDark: '#00FFD1',
    description: 'High-visibility luminescent accent for masked PII tokens (<AADHAAR_1>, <PAN_1>).',
    bgClass: 'bg-neon',
    borderClass: 'border-neon',
    textClass: 'text-neon',
  },
  {
    name: 'Enclave Obsidian (Card)',
    variable: '--card',
    hslDark: '224 24% 9.5%',
    hslLight: '0 0% 100%',
    hexDark: '#101521',
    description: 'Deep military-grade dark surface providing maximum contrast.',
    bgClass: 'bg-card',
    borderClass: 'border-border',
    textClass: 'text-card-foreground',
  },
];

export const DesignSystemTokens: React.FC = () => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopy = (variable: string) => {
    navigator.clipboard?.writeText?.(`var(${variable})`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <section id="design-system" className="py-16 sm:py-24 border-t border-border/80 bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-neon/40 text-neon font-mono text-xs">
                <Palette className="w-3 h-3 mr-1" /> DESIGN SYSTEM SPECIFICATION
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Security-First Color System & Tokens
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
              Engineered on shadcn primitives with tailored Indian sovereign accents
              and an ultra-vibrant neon token layer for instantaneous PII visual auditing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Tokens ready for CSS & Tailwind</span>
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DESIGN_TOKENS.map((token) => (
            <div
              key={token.variable}
              className="group relative rounded-2xl border border-border/80 bg-card/80 p-4 transition-all duration-300 hover:border-foreground/30 hover:shadow-xl backdrop-blur-sm"
            >
              {/* Swatch Preview Bar */}
              <div
                className={`w-full h-24 rounded-xl ${token.bgClass} flex items-end p-2.5 relative overflow-hidden shadow-inner`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <span className="relative z-10 text-[11px] font-mono font-bold text-white tracking-wider">
                  {token.hexDark}
                </span>
              </div>

              {/* Token Info */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{token.name}</h3>
                </div>

                <div className="flex items-center justify-between text-xs font-mono bg-background/80 rounded-md p-1.5 border border-border/60">
                  <span className="text-foreground/80">{token.variable}</span>
                  <button
                    onClick={() => handleCopy(token.variable)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Copy CSS variable"
                  >
                    {copiedVar === token.variable ? (
                      <Check className="h-3.5 w-3.5 text-indiaGreen" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {token.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Masked Token Chip Showcase */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon" />
                <span>Masked Token Component Specification</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deterministic placeholder chips recognized by the pipeline across all Indian identity schemes.
              </p>
            </div>
            <Badge variant="neon" className="self-start sm:self-auto text-[10px]">
              &lt;TOKEN_STYLE&gt;
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Aadhaar:</span>
              <span className="token-badge px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow-neon-glow">
                &lt;AADHAAR_1&gt;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">PAN:</span>
              <span className="token-badge px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow-neon-glow">
                &lt;PAN_1&gt;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">GSTIN:</span>
              <span className="token-badge px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow-neon-glow">
                &lt;GSTIN_1&gt;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Phone:</span>
              <span className="token-badge px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow-neon-glow">
                &lt;PHONE_1&gt;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Passport:</span>
              <span className="token-badge px-3 py-1 rounded-md text-xs sm:text-sm font-bold shadow-neon-glow">
                &lt;PASSPORT_1&gt;
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
