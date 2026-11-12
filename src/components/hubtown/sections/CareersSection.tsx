import React from 'react';
import {
  Users,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleItem {
  title: string;
  department: string;
  location: string;
  type: string;
}

const ROLES: RoleItem[] = [
  {
    title: 'Senior Kernel & Micro-Vault Engineer',
    department: 'Core Cryptographic Runtime',
    location: 'Mumbai (BKC) / Hybrid',
    type: 'Full-Time',
  },
  {
    title: 'LLM Security Researcher (PII Egress Analysis)',
    department: 'Applied Frontier Intelligence',
    location: 'Bengaluru / Remote',
    type: 'Full-Time',
  },
  {
    title: 'Sovereign Distributed Systems Architect',
    department: 'Enclave Infrastructure & Mesh',
    location: 'Mumbai / Remote',
    type: 'Full-Time',
  },
];

export const CareersSection: React.FC = () => {
  return (
    <section
      id="careers"
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <Badge
              variant="outline"
              className="border-indiaGreen/50 text-indiaGreen font-mono text-xs mb-3"
            >
              <Users className="w-3.5 h-3.5 mr-1" /> // CAREERS AT ZEROLEAK
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Join the privacy <br />
              <span className="text-indiaGreen">frontier.</span>
            </h2>
          </div>

          <p className="text-sm font-mono text-muted-foreground max-w-sm">
            We are hiring researchers, kernel architects, and security engineers
            building the sovereign data layer for 1.4 billion citizens.
          </p>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="p-6 sm:p-8 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-foreground/40 transition-all duration-300 group"
            >
              <div>
                <span className="text-xs font-mono font-bold text-neon uppercase tracking-wider">
                  {role.department}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1 group-hover:text-neon transition-colors">
                  {role.title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span>{role.location}</span>
                  <span>•</span>
                  <span>{role.type}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="h-11 px-6 rounded-xl border-border/80 font-mono text-xs font-bold gap-2 group-hover:bg-foreground group-hover:text-background transition-all"
              >
                <span>APPLY TO VAULT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
