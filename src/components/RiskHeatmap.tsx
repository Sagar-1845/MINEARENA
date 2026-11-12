import React, { useState } from 'react';
import { Shield, AlertTriangle, Flame, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface HeatmapEntity {
  type: string;
  value: string;
  start?: number;
  end?: number;
}

interface RiskHeatmapProps {
  originalText: string;
  maskedText?: string;
  detectedEntities?: HeatmapEntity[];
  riskScore: number;
  severity?: string;
  injectionConfidence?: number;
  isInjectionFlagged?: boolean;
}

// Weight mapping to determine risk temperature (0.0 to 1.0)
const PII_WEIGHTS: Record<string, number> = {
  AADHAAR: 0.95,
  PAN: 0.85,
  GSTIN: 0.75,
  PASSPORT: 0.85,
  VOTER_ID: 0.7,
  PHONE: 0.5,
  EMAIL: 0.45,
  NAME: 0.35,
};

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  originalText,
  detectedEntities = [],
  riskScore,
  severity = 'LOW',
  injectionConfidence = 0,
  isInjectionFlagged = false,
}) => {
  const [hoveredToken, setHoveredToken] = useState<{
    text: string;
    type: string;
    risk: number;
    description: string;
  } | null>(null);

  // Parse text into tokens with risk temperature
  const tokens = React.useMemo(() => {
    if (!originalText) return [];

    // Identify spans of detected entities
    const spans: { start: number; end: number; type: string; value: string; risk: number }[] = [];

    detectedEntities.forEach((ent) => {
      const idx = originalText.indexOf(ent.value);
      if (idx !== -1) {
        const normType = ent.type.toUpperCase();
        const baseRisk = PII_WEIGHTS[normType] || 0.4;
        spans.push({
          start: idx,
          end: idx + ent.value.length,
          type: normType,
          value: ent.value,
          risk: baseRisk,
        });
      }
    });

    // Also detect injection phrases if flagged
    if (isInjectionFlagged) {
      const injectionTriggers = [
        'ignore all previous instructions',
        'system constraints',
        'raw encryption keys',
        'unmasked customer data',
        'bypass',
        'override',
      ];
      injectionTriggers.forEach((trig) => {
        const idx = originalText.toLowerCase().indexOf(trig);
        if (idx !== -1) {
          spans.push({
            start: idx,
            end: idx + trig.length,
            type: 'PROMPT_INJECTION',
            value: originalText.slice(idx, idx + trig.length),
            risk: 0.98,
          });
        }
      });
    }

    // Sort spans by start
    spans.sort((a, b) => a.start - b.start);

    // Build token list
    const result: {
      text: string;
      isHighlighted: boolean;
      type: string;
      risk: number;
    }[] = [];

    let currentPos = 0;
    spans.forEach((span) => {
      if (span.start > currentPos) {
        // Normal text in between
        const nonEntityText = originalText.slice(currentPos, span.start);
        const words = nonEntityText.split(/(\s+)/);
        words.forEach((w) => {
          if (w.length > 0) {
            result.push({
              text: w,
              isHighlighted: false,
              type: 'SAFE_TEXT',
              risk: 0.05,
            });
          }
        });
      }

      // Highlighted entity
      result.push({
        text: span.value,
        isHighlighted: true,
        type: span.type,
        risk: span.risk,
      });

      currentPos = Math.max(currentPos, span.end);
    });

    // Remaining text
    if (currentPos < originalText.length) {
      const remaining = originalText.slice(currentPos);
      const words = remaining.split(/(\s+)/);
      words.forEach((w) => {
        if (w.length > 0) {
          result.push({
            text: w,
            isHighlighted: false,
            type: 'SAFE_TEXT',
            risk: 0.05,
          });
        }
      });
    }

    return result;
  }, [originalText, detectedEntities, isInjectionFlagged]);

  // Determine heatmap badge style
  const getHeatmapColor = (risk: number, type: string) => {
    if (type === 'PROMPT_INJECTION') {
      return 'bg-red-500/30 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    }
    if (risk >= 0.85) {
      return 'bg-red-600/25 text-red-300 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
    }
    if (risk >= 0.7) {
      return 'bg-orange-500/25 text-orange-300 border-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.35)]';
    }
    if (risk >= 0.45) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/70 shadow-[0_0_6px_rgba(234,179,8,0.3)]';
    }
    if (risk >= 0.25) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_6px_rgba(6,182,212,0.25)]';
    }
    return 'text-muted-foreground/90';
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-5 backdrop-blur-xl space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Token Sensitivity & Risk Heatmap
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted-foreground">Composite Intensity:</span>
          <Badge
            variant={
              riskScore > 60 ? 'destructive' : riskScore > 30 ? 'saffron' : 'green'
            }
            className="font-bold text-xs"
          >
            {riskScore.toFixed(1)} / 100 ({severity})
          </Badge>
        </div>
      </div>

      {/* Interactive Heatmap Container */}
      <div className="p-4 rounded-xl bg-background/90 border border-border/80 font-mono text-xs sm:text-sm leading-relaxed min-h-[90px] select-text">
        {tokens.map((token, i) => {
          if (!token.isHighlighted) {
            return (
              <span
                key={i}
                className="text-foreground/80 hover:bg-white/5 transition-colors rounded px-0.5"
                onMouseEnter={() =>
                  setHoveredToken({
                    text: token.text.trim(),
                    type: 'Standard Token',
                    risk: 5,
                    description: 'Zero sensitive data identified. Safe for forwarding.',
                  })
                }
                onMouseLeave={() => setHoveredToken(null)}
              >
                {token.text}
              </span>
            );
          }

          return (
            <span
              key={i}
              className={cn(
                'inline-block px-1.5 py-0.5 mx-0.5 rounded font-bold border transition-all cursor-pointer',
                getHeatmapColor(token.risk, token.type)
              )}
              onMouseEnter={() =>
                setHoveredToken({
                  text: token.text,
                  type: token.type,
                  risk: Math.round(token.risk * 100),
                  description:
                    token.type === 'PROMPT_INJECTION'
                      ? 'Adversarial system override attempt detected! High security risk.'
                      : `Statutory Indian PII: ${token.type}. Redaction required under DPDP Sec 8(5).`,
                })
              }
              onMouseLeave={() => setHoveredToken(null)}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {/* Hover Inspection Inspector Box */}
      <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 text-xs font-mono flex items-center justify-between min-h-[38px]">
        {hoveredToken && hoveredToken.text ? (
          <div className="flex items-center gap-3 text-foreground">
            <span className="font-bold text-saffron">[{hoveredToken.type}]</span>
            <span className="text-muted-foreground truncate max-w-xs">"{hoveredToken.text}"</span>
            <span className="text-[11px] text-foreground/80 hidden sm:inline">{hoveredToken.description}</span>
            <Badge variant="outline" className="ml-auto font-mono text-[10px]">
              {hoveredToken.risk}% Thermal Weight
            </Badge>
          </div>
        ) : (
          <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Hover over any word or entity token above to inspect its granular risk temperature.</span>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-muted-foreground border-t border-border/40">
        <span className="font-semibold text-foreground/80">Heat Spectrum:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/60" />
            <span>0-10% Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500/70" />
            <span>10-35% Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
            <span>35-65% Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-orange-500/90" />
            <span>65-85% High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-600 shadow-[0_0_6px_red]" />
            <span>85-100% Critical / Leak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmap;
