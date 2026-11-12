import React from 'react';
import { Shield, Lock, Terminal, Code2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/80 bg-background/80 py-12 text-xs font-mono text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border">
              <Shield className="w-4 h-4 text-saffron" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">ZeroLeak AI Gateway</p>
              <p className="text-[11px] text-muted-foreground">
                Enterprise Privacy Gateway for Foundation Models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-indiaGreen font-semibold">
              <span className="w-2 h-2 rounded-full bg-indiaGreen" /> DPDP Act 2023 Compliant
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5 text-neon font-semibold">
              <Lock className="w-3 h-3 text-neon" /> Zero Cloud Retention
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-center sm:text-left">
            <strong className="text-foreground/90">Specimen Disclaimer:</strong> All ID cards
            rendered across this interface are stylized synthetic prototypes containing fictional
            names and test numbers. Absolutely no government logos, crests, or official emblems are used.
          </p>
          <p className="text-muted-foreground whitespace-nowrap">
            Built with DPDP-first security architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};
