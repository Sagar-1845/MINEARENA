import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnclaveRegion {
  id: string;
  name: string;
  zone: string;
  enclaveCount: string;
  coordinates: string;
  latency: string;
  status: string;
  activePolicies: string[];
  description: string;
  facilities: string[];
}

const REGIONS: EnclaveRegion[] = [
  {
    id: 'western',
    name: 'Western Cyber Perimeter',
    zone: 'Mumbai Suburban & BKC Core',
    enclaveCount: '18 Active Enclaves',
    coordinates: '19.0760° N, 72.8777° E',
    latency: '8.4 ms',
    status: 'OPERATIONAL • 100% GUARDED',
    activePolicies: ['Aadhaar Masking', 'FinPAN Vault', 'Passport Anonymizer'],
    description:
      'High-throughput perimeter shielding the primary banking and enterprise corridor in Western India with on-premise hardware-accelerated tokenization.',
    facilities: [
      'BKC Financial Enclave (Level 4)',
      'Andheri Gateway Node 02',
      'Bandra Sovereign Vault Alpha',
    ],
  },
  {
    id: 'south',
    name: 'South Financial Vaults',
    zone: 'Nariman Point & Fort District',
    enclaveCount: '12 Secure Enclaves',
    coordinates: '18.9256° N, 72.8242° E',
    latency: '6.1 ms',
    status: 'OPERATIONAL • ZERO LEAK',
    activePolicies: ['GSTIN Corporate Shield', 'Banking PAN Tokenizer', 'SEBI Data Residency'],
    description:
      'Ultra-low-latency financial security clusters dedicated to institutional securities exchanges, payment aggregators, and core banking engines.',
    facilities: [
      'Dalal Street Core Vault',
      'Nariman Heritage Cluster 01',
      'Colaba Ingress Barrier',
    ],
  },
  {
    id: 'central',
    name: 'Central Cloud Shield',
    zone: 'Lower Parel & Powai Tech Corridor',
    enclaveCount: '09 Barrier Nodes',
    coordinates: '19.1176° N, 72.9060° E',
    latency: '11.2 ms',
    status: 'OPERATIONAL • AIR-GAPPED',
    activePolicies: ['Voter ID Anonymizer', 'Clinical Record Shield', 'UIDAI Verhoeff Check'],
    description:
      'High-density LLM tokenization barriers servicing healthtech, fintech, and e-governance applications with deterministic surrogate routing.',
    facilities: [
      'Powai AI Research Enclave',
      'Lower Parel Hub 04',
      'Kanjurmarg Data Perimeter',
    ],
  },
  {
    id: 'north',
    name: 'Northern Air-Gapped Hubs',
    zone: 'Thane & Navi Mumbai Industrial Ring',
    enclaveCount: '06 Sovereign Hubs',
    coordinates: '19.2183° N, 72.9781° E',
    latency: '13.5 ms',
    status: 'OPERATIONAL • DPDP CERTIFIED',
    activePolicies: ['Driving Licence Vault', 'National ID Barrier', 'Public Sector Enclave'],
    description:
      'Geographically redundant failover enclaves providing multi-datacenter synchronization and persistent encrypted surrogate lookup tables.',
    facilities: [
      'Thane Sovereign Datacenter 01',
      'Airoli Disaster Recovery Vault',
      'Mahape Micro-Gateway 03',
    ],
  },
];

export const SpatialEnclaveMapSection: React.FC = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('western');

  const activeRegion =
    REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];

  return (
    <section
      id="spatial-map"
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <Badge
              variant="outline"
              className="border-indiaGreen/50 text-indiaGreen font-mono text-xs mb-3"
            >
              <Globe className="w-3.5 h-3.5 mr-1" /> // SPATIAL INFRASTRUCTURE MAP
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Geographic Enclaves & <br />
              <span className="text-indiaGreen">Sovereign Corridors.</span>
            </h2>
          </div>

          <p className="text-sm font-mono text-muted-foreground max-w-sm">
            Interactive infrastructure mapping modeled after regional deployment
            hubs across the Mumbai Metropolitan Area & pan-India enterprise nodes.
          </p>
        </div>

        {/* Region Filter Selector Tabs (Hubtown Signature Category Switcher) */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-6 mb-10">
          {REGIONS.map((region) => {
            const isSelected = region.id === selectedRegionId;
            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-mono text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? 'bg-foreground text-background shadow-lg scale-105'
                    : 'bg-card/80 text-muted-foreground border border-border/80 hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                <span>{region.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-background/20 text-background'
                      : 'bg-secondary text-foreground/80'
                  }`}
                >
                  {region.enclaveCount.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Tactical Map Stage & Node Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Canvas: Stylized Interactive Vector/Spatial Map Grid */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 security-grid opacity-20 pointer-events-none" />

            {/* Top Telemetry Overlay */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 text-neon font-bold">
                <Activity className="w-3.5 h-3.5 text-neon animate-pulse" />
                RADAR PING: ACTIVE
              </span>
              <span>COORDS: {activeRegion.coordinates}</span>
            </div>

            {/* Tactical Map Nodes Layout */}
            <div className="relative z-10 my-auto py-12 flex flex-col items-center justify-center">
              {/* Outer Radar Rings */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-neon/20 animate-ping opacity-25 duration-1000" />
                <div className="absolute inset-6 rounded-full border border-border/60 border-dashed" />
                <div className="absolute inset-16 rounded-full border border-saffron/30" />
                <div className="absolute inset-28 rounded-full border border-indiaGreen/40" />

                {/* Center Core Node */}
                <div className="relative z-20 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-card via-background to-card border-2 border-neon shadow-neon-glow p-3 text-center">
                  <MapPin className="w-6 h-6 text-neon mb-1 animate-bounce" />
                  <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-tight">
                    {activeRegion.id}
                  </span>
                </div>

                {/* Surrounding Satellite Nodes */}
                <div className="absolute top-4 left-8 px-3 py-1.5 rounded-lg border border-border bg-card/90 text-[10px] font-mono text-foreground/90 backdrop-blur-sm shadow-md">
                  ENCLAVE-01 • LATENCY {activeRegion.latency}
                </div>

                <div className="absolute bottom-6 right-8 px-3 py-1.5 rounded-lg border border-border bg-card/90 text-[10px] font-mono text-foreground/90 backdrop-blur-sm shadow-md">
                  VAULT-02 • {activeRegion.status.split('•')[0]}
                </div>
              </div>
            </div>

            {/* Bottom Map Status Bar */}
            <div className="relative z-10 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>SECURITY PROTOCOL: LOCAL RAM ISOLATION</span>
              <span className="text-indiaGreen font-bold">ZERO OUTBOUND EXPOSURE</span>
            </div>
          </div>

          {/* Right Inspector: Regional Specs & Facility Directory */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-neon uppercase tracking-widest">
                  {activeRegion.zone}
                </span>
                <span className="text-xs font-mono text-indiaGreen bg-indiaGreen/10 px-2.5 py-0.5 rounded-full border border-indiaGreen/30">
                  {activeRegion.enclaveCount}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {activeRegion.name}
              </h3>

              <p className="mt-4 text-sm text-foreground/80 leading-relaxed font-sans">
                {activeRegion.description}
              </p>
            </div>

            {/* Active Enclave Facilities in this Region */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-muted-foreground block uppercase tracking-wider font-bold">
                // CONNECTED SOVEREIGN FACILITIES
              </span>
              <div className="space-y-2">
                {activeRegion.facilities.map((facility, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs font-mono text-foreground/90"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indiaGreen" />
                      <span>{facility}</span>
                    </span>
                    <span className="text-muted-foreground text-[10px]">VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Applied Policy Tags */}
            <div className="pt-4 border-t border-border/40">
              <span className="text-xs font-mono text-muted-foreground block uppercase tracking-wider mb-2.5 font-bold">
                // ENFORCED TOKENIZATION POLICIES
              </span>
              <div className="flex flex-wrap gap-2">
                {activeRegion.activePolicies.map((policy) => (
                  <Badge
                    key={policy}
                    variant="outline"
                    className="font-mono text-[10px] border-border/80 text-foreground bg-background/50"
                  >
                    {policy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpatialEnclaveMapSection;
