import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUp, Lock, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HubtownFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#020A19] text-[#D5E0FF] border-t border-[#D5E0FF]/15 overflow-hidden pt-20 pb-12 px-6 sm:px-12 md:px-16 select-none">
      {/* Massive Hubtown-Style Monolith Architectural Watermark */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 text-[14vw] font-black tracking-tighter text-white/[0.02] dark:text-white/[0.03] pointer-events-none whitespace-nowrap uppercase font-mono"
      >
        ZEROLEAK.AI
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 pb-16 border-b border-border/30">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border">
                <Shield className="w-5 h-5 text-saffron" />
              </div>
              <span className="text-xl font-black font-mono tracking-widest text-foreground uppercase">
                ZEROLEAK<span className="text-neon">.AI</span>
              </span>
            </div>

            <p className="mt-4 text-xs font-mono text-muted-foreground max-w-sm leading-relaxed">
              Sovereign on-premises privacy perimeter for enterprise foundation models.
              Zero raw personal citizen data crosses VPC or external cloud boundaries.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link to="/demo">
                <Button
                  variant="saffron"
                  size="sm"
                  className="font-mono text-xs font-bold gap-2 rounded-xl h-10 px-4"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Launch Live Gateway</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Directory Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
            <div>
              <span className="text-neon font-bold uppercase tracking-widest block mb-4">
                // ARCHITECTURE
              </span>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#mission" className="hover:text-foreground transition-colors">
                    Mission & Ethos
                  </a>
                </li>
                <li>
                  <a href="#spatial-map" className="hover:text-foreground transition-colors">
                    Spatial Enclave Map
                  </a>
                </li>
                <li>
                  <a href="#specimens" className="hover:text-foreground transition-colors">
                    Specimen Showcase
                  </a>
                </li>
                <li>
                  <Link to="/demo" className="hover:text-foreground transition-colors">
                    Sandbox Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-saffron font-bold uppercase tracking-widest block mb-4">
                // TELEMETRY
              </span>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link to="/metrics" className="hover:text-foreground transition-colors">
                    Runtime Metrics
                  </Link>
                </li>
                <li>
                  <Link to="/audit" className="hover:text-foreground transition-colors">
                    Audit Log Ledger
                  </Link>
                </li>
                <li>
                  <Link to="/dataset" className="hover:text-foreground transition-colors">
                    Synthetic Corpus
                  </Link>
                </li>
                <li>
                  <a href="#disclosures" className="hover:text-foreground transition-colors">
                    Public Disclosures
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-indiaGreen font-bold uppercase tracking-widest block mb-4">
                // COMPANY
              </span>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#careers" className="hover:text-foreground transition-colors">
                    Careers (3 Roles)
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-foreground transition-colors">
                    Drop Us a Line
                  </a>
                </li>
                <li>
                  <span className="text-foreground/70">DPDP Act 2023 Compliant</span>
                </li>
                <li>
                  <span className="text-foreground/70">ISO 27001 Certified</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div>
            © 2026 ZEROLEAK AI TECHNOLOGIES LIMITED. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-foreground font-bold">
              MineArena 1.0 | Code Commit | BIET Davangere
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-neon transition-colors"
            >
              <span>TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HubtownFooter;
