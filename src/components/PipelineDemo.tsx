import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Copy,
  Terminal,
  Server,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PipelineDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);

  return (
    <section id="pipeline-demo" className="py-16 sm:py-24 border-t border-border/80 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="border-saffron/40 text-saffron font-mono text-xs mb-3">
            DPDP PIPELINE WORKFLOW
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            How The Gateway Protects Enterprise LLMs
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Experience the three-stage lifecycle: Ingestion interception, zero-leak
            cryptographic tokenization, and on-premises client-side reconstruction.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-secondary/60 border border-border/80 mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeStep === 1
                ? 'bg-card text-foreground shadow-md border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-saffron/15 text-saffron flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            <span className="truncate">1. Detect</span>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeStep === 2
                ? 'bg-card text-foreground shadow-md border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-neon/15 text-neon flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            <span className="truncate">2. Mask</span>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeStep === 3
                ? 'bg-card text-foreground shadow-md border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indiaGreen/15 text-indiaGreen flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            <span className="truncate">3. Restore</span>
          </button>
        </div>

        {/* Interactive Step Card */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center border border-saffron/30">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Stage 1: Detect the Sensitive
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        Perimeter inspection catches Indian resident PII before network egress
                      </p>
                    </div>
                  </div>
                  <Badge variant="saffron" className="text-[10px] font-mono">
                    INTERCEPTED
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs sm:text-sm space-y-2">
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wider">
                    // RAW INCOMING PROMPT FROM APPLICATION
                  </div>
                  <div className="text-foreground/90 leading-relaxed">
                    &quot;Please review KYC application for customer{' '}
                    <span className="bg-destructive/20 text-destructive border-b border-destructive px-1 rounded">
                      Aarav Sharma
                    </span>
                    , Aadhaar{' '}
                    <span className="bg-destructive/20 text-destructive border-b border-destructive px-1 rounded">
                      4932 8109 2384
                    </span>{' '}
                    and PAN{' '}
                    <span className="bg-destructive/20 text-destructive border-b border-destructive px-1 rounded">
                      ABCDE1234F
                    </span>
                    . Check if CIBIL score verification is complete.&quot;
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">DPDP Classifier:</span>
                    <span className="text-muted-foreground">
                      Identified 3 sensitive personal identifiers (Aadhaar, PAN, Citizen Name).
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">Action Taken:</span>
                    <span className="text-muted-foreground">
                      Halted outbound network egress; rerouted to on-premise Token Vault.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon/15 text-neon flex items-center justify-center border border-neon/30">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Stage 2: Mask the Personal
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        Identifiers isolated in local vault and replaced by secure tokens
                      </p>
                    </div>
                  </div>
                  <Badge variant="neon" className="text-[10px] font-mono">
                    SANITIZED PAYLOAD
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs sm:text-sm space-y-2">
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wider flex items-center justify-between">
                    <span>// SANITIZED PAYLOAD DISPATCHED TO PUBLIC LLM</span>
                    <span className="text-neon flex items-center gap-1 text-[10px]">
                      <Cloud className="w-3 h-3" /> ZERO CLOUD LEAK
                    </span>
                  </div>
                  <div className="text-foreground/90 leading-relaxed">
                    &quot;Please review KYC application for customer{' '}
                    <span className="token-badge px-2 py-0.5 rounded text-xs font-bold inline-block mx-0.5">
                      &lt;PERSON_1&gt;
                    </span>
                    , Aadhaar{' '}
                    <span className="token-badge px-2 py-0.5 rounded text-xs font-bold inline-block mx-0.5">
                      &lt;AADHAAR_1&gt;
                    </span>{' '}
                    and PAN{' '}
                    <span className="token-badge px-2 py-0.5 rounded text-xs font-bold inline-block mx-0.5">
                      &lt;PAN_1&gt;
                    </span>
                    . Check if CIBIL score verification is complete.&quot;
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">Vault Mapping:</span>
                    <span className="text-muted-foreground">
                      &lt;AADHAAR_1&gt; = 4932 8109 2384 stored in isolated tenant RAM.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">Model Guarantee:</span>
                    <span className="text-muted-foreground">
                      Public LLM model provider never sees or trains on original citizen identity.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indiaGreen/15 text-indiaGreen flex items-center justify-center border border-indiaGreen/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Stage 3: Restore Locally
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        Inbound LLM response deanonymized locally inside your perimeter
                      </p>
                    </div>
                  </div>
                  <Badge variant="green" className="text-[10px] font-mono">
                    SEAMLESS RESTORATION
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs sm:text-sm space-y-2">
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wider flex items-center justify-between">
                    <span>// RESTORED OUTPUT RETURNED TO USER OR ENTERPRISE APP</span>
                    <span className="text-indiaGreen flex items-center gap-1 text-[10px]">
                      <Server className="w-3 h-3" /> ON-PREM RECONSTRUCTION
                    </span>
                  </div>
                  <div className="text-foreground/90 leading-relaxed">
                    &quot;Customer{' '}
                    <span className="bg-indiaGreen/15 text-indiaGreen border border-indiaGreen/30 px-1 rounded font-semibold">
                      Aarav Sharma
                    </span>{' '}
                    (Aadhaar ending in{' '}
                    <span className="bg-indiaGreen/15 text-indiaGreen border border-indiaGreen/30 px-1 rounded font-semibold">
                      2384
                    </span>
                    ) has passed PAN verification for{' '}
                    <span className="bg-indiaGreen/15 text-indiaGreen border border-indiaGreen/30 px-1 rounded font-semibold">
                      ABCDE1234F
                    </span>
                    . CIBIL score is 782 (Eligible).&quot;
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">Client Experience:</span>
                    <span className="text-muted-foreground">
                      Engineers get seamless natural responses without modifying existing code.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="font-semibold text-foreground block">Audit Trail:</span>
                    <span className="text-muted-foreground">
                      Tamper-evident cryptographically sealed audit log generated for DPDP audits.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
