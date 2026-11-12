import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck2,
  BarChart2,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const FooterCta: React.FC = () => {
  return (
    <footer className="border-t border-border/80 bg-background pt-16 pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-saffron/10 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        {/* Banner CTA Card */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/70 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden mb-16">
          {/* Subtle Tricolor Notch */}
          <div className="absolute top-0 left-12 right-12 h-1 flex rounded-full overflow-hidden">
            <span className="flex-1 bg-saffron" />
            <span className="flex-1 bg-white/70" />
            <span className="flex-1 bg-indiaGreen" />
          </div>

          <Badge variant="outline" className="border-saffron/40 text-saffron font-mono text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> GET STARTED WITH ZEROLEAK AI
          </Badge>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Deploy DPDP-Ready AI Privacy Across Your Fleet
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Eliminate cross-border data transfer liabilities. Keep Indian citizen
            identities contained within your sovereign infrastructure.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* Primary CTA button: Open the live demo */}
            <Link to="/demo" className="w-full sm:w-auto">
              <Button
                variant="saffron"
                size="lg"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-bold shadow-saffron-glow rounded-xl gap-2 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-neon"
              >
                <span>Open the live demo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/metrics" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 text-sm sm:text-base font-semibold rounded-xl gap-2 border-border hover:border-neon hover:text-neon focus-visible:ring-2 focus-visible:ring-neon"
              >
                <BarChart2 className="h-4 w-4 text-neon" />
                <span>Inspect Telemetry Metrics</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Navigation & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border shadow-md">
              <Shield className="w-5 h-5 text-saffron" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm tracking-tight">
                ZeroLeak <span className="text-saffron">AI Gateway</span>
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Sovereign Privacy Gateway for Foundation Models
              </p>
            </div>
          </div>

          {/* Links to Audit Log, Metrics, and Dataset */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
            <Link
              to="/audit"
              className="hover:text-foreground transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-md px-1 py-0.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-neon" />
              <span>Audit Log</span>
            </Link>

            <Link
              to="/metrics"
              className="hover:text-foreground transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-md px-1 py-0.5"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indiaGreen" />
              <span>Metrics</span>
            </Link>

            <Link
              to="/dataset"
              className="hover:text-foreground transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-md px-1 py-0.5"
            >
              <Terminal className="w-3.5 h-3.5 text-saffron" />
              <span>Synthetic Dataset</span>
            </Link>
          </div>
        </div>

        {/* Bottom Credits & Specimen Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          {/* Required event credit: "MineArena 1.0 | Code Commit | BIET Davangere" */}
          <p className="text-center sm:text-left flex items-center gap-1.5 text-foreground/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-indiaGreen" />
            <span>MineArena 1.0 | Code Commit | BIET Davangere</span>
          </p>

          <p className="text-[11px] text-muted-foreground/80 text-center sm:text-right">
            All cards rendered are synthetic sample specimens. No official emblems used.
          </p>
        </div>
      </div>
    </footer>
  );
};
