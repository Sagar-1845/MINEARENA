import React, { useState } from 'react';
import {
  Fingerprint,
  Cpu,
  Building2,
  Vote,
  Globe,
  Car,
  Shield,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrambleToken } from '@/components/ScrambleToken';

interface SpecimenDoc {
  id: string;
  code: string;
  name: string;
  category: string;
  icon: React.ElementType;
  rawSample: string;
  tokenSample: string;
  colorBorder: string;
  colorAccent: string;
  specDetails: { label: string; raw: string; token: string }[];
}

const SPECIMENS: SpecimenDoc[] = [
  {
    id: 'aadhaar',
    code: 'SPECIMEN 01',
    name: 'Aadhaar Sentinel',
    category: 'Unique Resident Identity',
    icon: Fingerprint,
    rawSample: 'XXXX XXXX 8921',
    tokenSample: '<AADHAAR_1>',
    colorBorder: 'border-saffron/70',
    colorAccent: 'text-saffron',
    specDetails: [
      { label: 'Citizen Name', raw: 'Aarav Sharma', token: '<PERSON_1>' },
      { label: 'UID Number', raw: 'XXXX XXXX 8921', token: '<AADHAAR_1>' },
      { label: 'DOB', raw: '14/08/1992', token: '<DOB_1>' },
      { label: 'Gender', raw: 'Male / M', token: '<GENDER_1>' },
    ],
  },
  {
    id: 'pan',
    code: 'SPECIMEN 02',
    name: 'FinPAN Shield',
    category: 'Direct Tax & Banking Record',
    icon: Cpu,
    rawSample: 'XXXXX 1234F',
    tokenSample: '<PAN_1>',
    colorBorder: 'border-neon/70',
    colorAccent: 'text-neon',
    specDetails: [
      { label: 'Taxpayer', raw: 'Priya Venkatesh', token: '<PERSON_1>' },
      { label: 'Permanent Acc No', raw: 'XXXXX 1234F', token: '<PAN_1>' },
      { label: "Father's Name", raw: 'R. Venkatesh', token: '<PERSON_2>' },
      { label: 'DOB', raw: '03/11/1988', token: '<DOB_2>' },
    ],
  },
  {
    id: 'gstin',
    code: 'SPECIMEN 03',
    name: 'GSTIN Enterprise',
    category: 'Commercial Registration',
    icon: Building2,
    rawSample: '29 XXXXX 1234 Z1',
    tokenSample: '<GSTIN_1>',
    colorBorder: 'border-amber-400/70',
    colorAccent: 'text-amber-400',
    specDetails: [
      { label: 'Entity Name', raw: 'Bharat Quantum Tech Pvt Ltd', token: '<ORG_1>' },
      { label: 'GSTIN Number', raw: '29 XXXXX 1234 Z1', token: '<GSTIN_1>' },
      { label: 'State Code', raw: 'Karnataka (29)', token: '<STATE_1>' },
      { label: 'Filing Status', raw: 'Active Taxpayer', token: '<STATUS_1>' },
    ],
  },
  {
    id: 'voter',
    code: 'SPECIMEN 04',
    name: 'Elector Photo ID',
    category: 'Civil Elector Registry',
    icon: Vote,
    rawSample: 'WXYZ 4829102',
    tokenSample: '<VOTER_ID_1>',
    colorBorder: 'border-purple-400/70',
    colorAccent: 'text-purple-400',
    specDetails: [
      { label: 'Elector Name', raw: 'Devika Sundaram', token: '<PERSON_1>' },
      { label: 'EPIC Number', raw: 'WXYZ 4829102', token: '<VOTER_ID_1>' },
      { label: 'Assembly Locus', raw: 'AC-152 Indiranagar', token: '<LOCUS_1>' },
      { label: 'Guardian', raw: 'S. Sundaram', token: '<PERSON_2>' },
    ],
  },
  {
    id: 'passport',
    code: 'SPECIMEN 05',
    name: 'Passport Sovereign',
    category: 'International Travel Document',
    icon: Globe,
    rawSample: 'Z 8192301',
    tokenSample: '<PASSPORT_1>',
    colorBorder: 'border-blue-400/70',
    colorAccent: 'text-blue-400',
    specDetails: [
      { label: 'Passport Holder', raw: 'Vikramaditya Roy', token: '<PERSON_1>' },
      { label: 'Document ID', raw: 'Z 8192301', token: '<PASSPORT_1>' },
      { label: 'Nationality', raw: 'INDIAN CITIZEN', token: '<NAT_1>' },
      { label: 'Expiry Date', raw: '24/09/2032', token: '<EXP_1>' },
    ],
  },
  {
    id: 'dl',
    code: 'SPECIMEN 06',
    name: 'Motor Driving Licence',
    category: 'Transport & Motor Authority',
    icon: Car,
    rawSample: 'KA-01-2022-0001234',
    tokenSample: '<DL_1>',
    colorBorder: 'border-indiaGreen/70',
    colorAccent: 'text-indiaGreen',
    specDetails: [
      { label: 'Licencee Name', raw: 'Karan Mehra', token: '<PERSON_1>' },
      { label: 'Licence Number', raw: 'KA-01-2022-0001234', token: '<DL_1>' },
      { label: 'Vehicle Class', raw: 'LMV / MCWG', token: '<CLASS_1>' },
      { label: 'Issuing RTO', raw: 'KA-01 Koramangala', token: '<RTO_1>' },
    ],
  },
];

export const SpecimenShowcaseSection: React.FC = () => {
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenDoc>(SPECIMENS[0]);
  const [isMasked, setIsMasked] = useState<boolean>(true);

  return (
    <section
      id="specimens"
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <Badge
              variant="outline"
              className="border-saffron/40 text-saffron font-mono text-xs mb-3"
            >
              <Layers className="w-3.5 h-3.5 mr-1" /> // LANDMARK SPECIMEN CARDS
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Recognized Specimen <br />
              <span className="saffron-gradient-text">Architectures.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMasked(!isMasked)}
              className="h-10 px-4 text-xs font-mono font-bold border-border/80 gap-2 rounded-xl"
            >
              {isMasked ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-neon" />
                  <span>Masked Tokens Active</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-saffron" />
                  <span>Show Raw Specimen Data</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 6-Card Grid Inspired by Hubtown Landmark Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SPECIMENS.map((spec) => {
            const Icon = spec.icon;
            const isSelected = activeSpecimen.id === spec.id;

            return (
              <div
                key={spec.id}
                onClick={() => setActiveSpecimen(spec)}
                className={`group p-6 sm:p-8 rounded-3xl border ${
                  isSelected
                    ? `${spec.colorBorder} bg-card/90 shadow-2xl scale-[1.02]`
                    : 'border-border/60 bg-card/60 hover:border-foreground/30'
                } backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                {/* Top Card Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                    {spec.code}
                  </span>
                  <span className="text-[9px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                    SAMPLE ONLY
                  </span>
                </div>

                {/* Card Icon & Title */}
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${spec.colorBorder} bg-secondary/50 mb-4 transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${spec.colorAccent}`} />
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {spec.category}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                    {spec.name}
                  </h3>
                </div>

                {/* Live Masking Scramble Preview */}
                <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>SURROGATE CONVERSION</span>
                    <span className="text-neon font-bold">100% REVERSIBLE</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-foreground/80 font-bold truncate max-w-[120px]">
                      {spec.rawSample}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mx-2" />
                    <span className="text-neon font-bold">
                      <ScrambleToken
                        text={isMasked ? spec.tokenSample : spec.rawSample}
                        className="px-2 py-0.5 rounded border border-neon/40 bg-neon/10"
                      />
                    </span>
                  </div>
                </div>

                {/* Micro Details List */}
                <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs font-mono">
                  {spec.specDetails.slice(0, 2).map((field, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>{field.label}:</span>
                      <span className="text-foreground font-semibold">
                        {isMasked ? field.token : field.raw}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecimenShowcaseSection;
