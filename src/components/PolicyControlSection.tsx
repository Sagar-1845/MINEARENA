import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sliders,
  Shield,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MaskingPolicy,
  DEFAULT_MASKING_POLICY,
  getStoredMaskingPolicy,
  saveStoredMaskingPolicy,
  processDocumentContent,
} from '@/lib/pipelineService';

interface PolicyControlSectionProps {
  onPolicyChange?: (policy: MaskingPolicy) => void;
}

export const PolicyControlSection: React.FC<PolicyControlSectionProps> = ({ onPolicyChange }) => {
  const [policy, setPolicy] = useState<MaskingPolicy>(getStoredMaskingPolicy());
  const [testText, setTestText] = useState<string>(
    'Borrower Aarav Sharma (Aadhaar: 2345 6789 0124, PAN: ABCDE1234F, Phone: +91 9876543210, Email: aarav.sharma@example.com) submitted KYC for loan review.'
  );

  useEffect(() => {
    const loaded = getStoredMaskingPolicy();
    setPolicy(loaded);
  }, []);

  const handleToggle = (key: keyof MaskingPolicy) => {
    const updated: MaskingPolicy = {
      ...policy,
      [key]: !policy[key],
    };
    setPolicy(updated);
    saveStoredMaskingPolicy(updated);
    if (onPolicyChange) onPolicyChange(updated);
  };

  const handleStyleChange = (style: MaskingPolicy['maskingStyle']) => {
    const updated: MaskingPolicy = { ...policy, maskingStyle: style };
    setPolicy(updated);
    saveStoredMaskingPolicy(updated);
    if (onPolicyChange) onPolicyChange(updated);
  };

  const handleThresholdChange = (val: number) => {
    const updated: MaskingPolicy = { ...policy, riskThreshold: val };
    setPolicy(updated);
    saveStoredMaskingPolicy(updated);
    if (onPolicyChange) onPolicyChange(updated);
  };

  const handleResetDefaults = () => {
    setPolicy(DEFAULT_MASKING_POLICY);
    saveStoredMaskingPolicy(DEFAULT_MASKING_POLICY);
    if (onPolicyChange) onPolicyChange(DEFAULT_MASKING_POLICY);
    toast.info('Policy reset to default enterprise configuration (Name unmasked).');
  };

  const handleSave = () => {
    saveStoredMaskingPolicy(policy);
    if (onPolicyChange) onPolicyChange(policy);
    toast.success('Privacy policy updated & synchronized across all enclaves!');
  };

  // Run live test of current policy against the preview text
  const previewResult = processDocumentContent(testText, policy);

  const ENTITY_CONFIGS: {
    key: keyof MaskingPolicy;
    label: string;
    sublabel: string;
    tag: string;
    isName?: boolean;
  }[] = [
    {
      key: 'maskName',
      label: 'Human Full Name',
      sublabel: 'e.g. Aarav Sharma, Priya Venkatesh',
      tag: 'Customer Identity',
      isName: true,
    },
    {
      key: 'maskAadhaar',
      label: 'Aadhaar 12-Digit UIDAI',
      sublabel: 'e.g. 2345 6789 0124 (Verhoeff Verified)',
      tag: 'High Risk Statutory',
    },
    {
      key: 'maskPan',
      label: 'PAN (Permanent Account Number)',
      sublabel: 'e.g. ABCDE1234F (Income Tax Department)',
      tag: 'Statutory Financial',
    },
    {
      key: 'maskPhone',
      label: 'Mobile / Telephone Number',
      sublabel: 'e.g. +91 9876543210 (Direct Contact)',
      tag: 'Contact PII',
    },
    {
      key: 'maskEmail',
      label: 'Email Address',
      sublabel: 'e.g. user@enterprise.com',
      tag: 'Electronic Mail',
    },
    {
      key: 'maskGstin',
      label: 'GSTIN (GST Identification)',
      sublabel: 'e.g. 29ABCDE1234F1Z5 (Corporate Tax)',
      tag: 'Enterprise Tax',
    },
    {
      key: 'maskPassport',
      label: 'Indian Passport Number',
      sublabel: 'e.g. Z1234567 (Travel Credential)',
      tag: 'Government ID',
    },
    {
      key: 'maskVoterId',
      label: 'Voter ID (EPIC Number)',
      sublabel: 'e.g. ABC1234567 (Election Commission)',
      tag: 'Government ID',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900 border border-cyan-800/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Dynamic Privacy Policy & Masking Control Matrix
            </h2>
            <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-300">
              DPDP Sec 8(5) Configurable
            </Badge>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl">
            Empower enterprise security officers to configure which entities are de-identified vs.
            preserved in plaintext, select masking representations, and define risk dispatch thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Sync Matrix
          </Button>
        </div>
      </div>

      {/* Main Grid: Entity Toggles & Strategy Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Entity Selection Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Entity De-Identification Toggles
            </h3>
            <span className="text-xs text-slate-400">
              Toggle ON to de-identify / mask; Toggle OFF to preserve in plaintext
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ENTITY_CONFIGS.map((item) => {
              const isMasked = policy[item.key] === true;

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                    isMasked
                      ? 'bg-slate-900/80 border-cyan-500/50 hover:border-cyan-400 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">{item.label}</span>
                        {item.isName && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] py-0 px-1.5">
                            {!isMasked ? 'Preserved (Default)' : 'Masking Enabled'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{item.sublabel}</p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        isMasked
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{item.tag}</span>
                    <span
                      className={`font-semibold ${
                        isMasked ? 'text-cyan-400' : 'text-emerald-400'
                      }`}
                    >
                      {isMasked ? 'DE-IDENTIFY' : 'PRESERVE PLAINTEXT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Masking Strategy & Risk Guard Threshold */}
        <div className="space-y-6">
          {/* Masking Style */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Masking Representation Style
            </h3>

            <div className="space-y-2">
              {[
                {
                  id: 'placeholder',
                  label: 'Reversible Placeholder',
                  example: '[AADHAAR_1]',
                  desc: 'Cryptographic mapping token reversible in local sovereign enclave',
                },
                {
                  id: 'blur',
                  label: 'Partial Obfuscation / Blur',
                  example: '**** **** 0124',
                  desc: 'Retains last 4 digits for auditability; prevents full exfiltration',
                },
                {
                  id: 'redacted',
                  label: 'Complete Redaction',
                  example: '[REDACTED_AADHAAR]',
                  desc: 'Standard enterprise blackout tag',
                },
                {
                  id: 'synthetic',
                  label: 'Differential Synthetic ID',
                  example: '9876 5432 1098',
                  desc: 'Replaces with plausible synthetic tokens to preserve model reasoning',
                },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleStyleChange(style.id as any)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    policy.maskingStyle === style.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-100">{style.label}</span>
                    <code className="text-cyan-300 font-mono text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/60">
                      {style.example}
                    </code>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{style.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Threshold & Gatekeeper Controls */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Enclave Dispatch Thresholds
            </h3>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300">Max Allowed Risk Score</span>
                <span className="font-mono font-bold text-cyan-400">{policy.riskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={policy.riskThreshold}
                onChange={(e) => handleThresholdChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Prompts scoring above {policy.riskThreshold} will be blocked from external LLM egress.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-300">Auto-block Prompt Injections</span>
                <input
                  type="checkbox"
                  checked={policy.blockOnInjection}
                  onChange={() => handleToggle('blockOnInjection')}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-300">Strict Outbound Leak Barrier</span>
                <input
                  type="checkbox"
                  checked={policy.strictLeakCheck}
                  onChange={() => handleToggle('strictLeakCheck')}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Live Policy Interactive Sandbox Preview */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Live Policy Inspector (Instant Real-time Simulation)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Name Handling:</span>
            <Badge
              variant="outline"
              className={
                policy.maskName
                  ? 'border-cyan-500/50 text-cyan-300'
                  : 'border-emerald-500/50 text-emerald-300'
              }
            >
              {policy.maskName ? 'Masked' : 'Unmasked (Preserved)'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Input Test Context</label>
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full text-xs font-mono bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-cyan-400 font-medium">
                Sanitized Outbound Payload ({policy.maskingStyle.toUpperCase()})
              </label>
              <span className="text-[11px] text-slate-400">
                Entities Masked: <strong className="text-cyan-300">{previewResult.stats.maskedCount}</strong> |
                Preserved: <strong className="text-emerald-300">{previewResult.stats.preservedCount}</strong>
              </span>
            </div>
            <div className="w-full text-xs font-mono bg-slate-950/70 border border-cyan-900/40 rounded-lg p-3 text-cyan-200 overflow-x-auto min-h-[72px]">
              {previewResult.sanitizedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
