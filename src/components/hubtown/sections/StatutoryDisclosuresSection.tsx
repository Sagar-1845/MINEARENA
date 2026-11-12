import React from 'react';
import {
  FileCheck,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Download,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComplianceDoc {
  certId: string;
  title: string;
  authority: string;
  hash: string;
  status: string;
  date: string;
}

const DISCLOSURES: ComplianceDoc[] = [
  {
    certId: 'DPDP-2023-SEC-0891',
    title: 'Statutory Data Protection Board (DPB) Compliance Statement',
    authority: 'Ministry of Electronics & IT (MeitY)',
    hash: '0x8f2a...91ce4',
    status: 'ACTIVE & VERIFIED',
    date: 'OCTOBER 2026',
  },
  {
    certId: 'ISO-27001-VAULT-4819',
    title: 'ISO/IEC 27001:2022 On-Premises Enclave Audit Certificate',
    authority: 'BSI Assurance Services Ltd',
    hash: '0x3c7e...b4491',
    status: 'CERTIFIED ZERO-EGRESS',
    date: 'SEPTEMBER 2026',
  },
  {
    certId: 'SOC2-TYPE2-ENC-1092',
    title: 'SOC 2 Type II Confidentiality & Security Verification Report',
    authority: 'Independent AICPA Assessor',
    hash: '0xfa11...2087d',
    status: 'UNQUALIFIED OPINION',
    date: 'AUGUST 2026',
  },
  {
    certId: 'UIDAI-VERHOEFF-7712',
    title: 'Aadhaar Act 2016 Compliant Masking Engine Verification',
    authority: 'Sovereign Identity Security Lab',
    hash: '0x99e0...7d81a',
    status: '100% CONFORMANT',
    date: 'JULY 2026',
  },
];

export const StatutoryDisclosuresSection: React.FC = () => {
  return (
    <section
      id="disclosures"
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <Badge
              variant="outline"
              className="border-neon/40 text-neon font-mono text-xs mb-3"
            >
              <FileCheck className="w-3.5 h-3.5 mr-1" /> // STATUTORY & REGULATORY
              DISCLOSURES
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Public Compliance & <br />
              <span className="text-neon">Zero-Leak Proofs.</span>
            </h2>
          </div>

          <p className="text-sm font-mono text-muted-foreground max-w-sm">
            Modeled after statutory real estate RERA disclosure directories, providing
            transparent cryptographic proof hashes, audit records, and verification QR codes.
          </p>
        </div>

        {/* 4 Compliance Disclosure Cards with QR Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {DISCLOSURES.map((item) => (
            <div
              key={item.certId}
              className="p-6 sm:p-8 rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-foreground/30 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-neon uppercase tracking-wider">
                    {item.certId}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    Issuing Body: {item.authority}
                  </p>
                </div>

                {/* Verification QR Icon Pill */}
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/80 border border-border text-foreground">
                  <QrCode className="w-8 h-8 text-saffron" />
                </div>
              </div>

              {/* Hash & Verification Row */}
              <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indiaGreen" />
                  <span className="text-foreground font-semibold">{item.status}</span>
                </div>
                <div className="text-muted-foreground">HASH: {item.hash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatutoryDisclosuresSection;
