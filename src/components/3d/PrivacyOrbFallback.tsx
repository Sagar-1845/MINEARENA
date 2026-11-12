import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface PrivacyOrbFallbackProps {
  className?: string;
}

export const PrivacyOrbFallback: React.FC<PrivacyOrbFallbackProps> = ({
  className = '',
}) => {
  return (
    <div
      role="img"
      aria-label="Privacy Gateway Vault visualization"
      className={`relative flex items-center justify-center p-6 select-none ${className}`}
    >
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-saffron/20 via-neon/15 to-indiaGreen/20 blur-xl opacity-60" />

      {/* Stylized Static Shield Enclave Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-border/80 bg-card/90 backdrop-blur-md shadow-2xl p-4">
        {/* Concentric rings */}
        <div className="absolute inset-2 rounded-full border border-dashed border-neon/30" />
        <div className="absolute inset-5 rounded-full border border-saffron/40" />
        <div className="absolute inset-8 rounded-full border border-indiaGreen/40" />

        {/* Center Icons */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron/20 via-background to-indiaGreen/20 border border-neon/50 shadow-neon-glow">
          <ShieldCheck className="w-8 h-8 text-neon" />
        </div>

        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 border border-border/60">
          <Lock className="w-3 h-3 text-indiaGreen" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-foreground/80">
            LOCAL VAULT
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyOrbFallback;
