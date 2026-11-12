import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  CreditCard,
  Phone,
  Mail,
  User,
  Hash,
  ArrowRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MaskedTextDisplayProps {
  sanitizedText: string;
  originalText?: string;
  restoredText?: string;
  entityMapping?: Record<string, string>;
  detectedPlaceholders?: string[];
}

export const MaskedTextDisplay: React.FC<MaskedTextDisplayProps> = ({
  sanitizedText,
  originalText = '',
  restoredText = '',
  entityMapping = {},
  detectedPlaceholders = [],
}) => {
  const [activeTab, setActiveTab] = useState<'masked' | 'original' | 'restored' | 'table'>('masked');
  const [revealedPlaceholders, setRevealedPlaceholders] = useState<Record<string, boolean>>({});
  const [hasCopied, setHasCopied] = useState(false);

  const toggleReveal = (placeholder: string) => {
    setRevealedPlaceholders((prev) => ({
      ...prev,
      [placeholder]: !prev[placeholder],
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Helper to get placeholder icon and badge style
  const getPlaceholderStyle = (ph: string) => {
    const upper = ph.toUpperCase();
    if (upper.includes('AADHAAR')) {
      return {
        icon: <Shield className="w-3 h-3 text-blue-400" />,
        bg: 'bg-blue-950/70 border-blue-500/80 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.35)]',
        label: 'Aadhaar ID',
      };
    }
    if (upper.includes('PAN')) {
      return {
        icon: <CreditCard className="w-3 h-3 text-purple-400" />,
        bg: 'bg-purple-950/70 border-purple-500/80 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.35)]',
        label: 'PAN Tax ID',
      };
    }
    if (upper.includes('PHONE')) {
      return {
        icon: <Phone className="w-3 h-3 text-teal-400" />,
        bg: 'bg-teal-950/70 border-teal-500/80 text-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.35)]',
        label: 'Mobile Phone',
      };
    }
    if (upper.includes('EMAIL')) {
      return {
        icon: <Mail className="w-3 h-3 text-amber-400" />,
        bg: 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]',
        label: 'Email Address',
      };
    }
    if (upper.includes('NAME') || upper.includes('PERSON')) {
      return {
        icon: <User className="w-3 h-3 text-emerald-400" />,
        bg: 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]',
        label: 'Person Name',
      };
    }
    return {
      icon: <Hash className="w-3 h-3 text-cyan-400" />,
      bg: 'bg-cyan-950/70 border-cyan-500/80 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.35)]',
      label: 'Identifier',
    };
  };

  // Render tokens within text replacing [TYPE_N] or <TYPE_N> with interactive chips
  const renderInteractiveText = (text: string) => {
    if (!text) return null;

    // Pattern matches both [TYPE_N] and <TYPE_N>
    const tokenRegex = /(\[[A-Z_]+_\d+\]|<[A-Z_]+_\d+>)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (tokenRegex.test(part)) {
        const style = getPlaceholderStyle(part);
        const originalVal = entityMapping[part];
        const isRevealed = revealedPlaceholders[part];

        return (
          <button
            key={index}
            onClick={() => toggleReveal(part)}
            title={originalVal ? `Click to ${isRevealed ? 'hide' : 'reveal'} original value` : part}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1 my-0.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer select-none',
              style.bg,
              isRevealed && 'bg-amber-500/20 border-amber-500 text-amber-300'
            )}
          >
            {isRevealed ? <Unlock className="w-3 h-3 text-amber-400" /> : style.icon}
            <span>{isRevealed && originalVal ? originalVal : part}</span>
            {originalVal && (
              <span className="text-[10px] opacity-70 ml-0.5">
                {isRevealed ? '(revealed)' : '(click to peek)'}
              </span>
            )}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-5 backdrop-blur-xl space-y-4 shadow-xl">
      {/* Header and View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#37d3fc]" />
          <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            De-Identification & Masking Results
          </span>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/60 text-xs font-mono">
          <button
            onClick={() => setActiveTab('masked')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer',
              activeTab === 'masked'
                ? 'bg-card text-[#37d3fc] shadow-sm border border-[#37d3fc]/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Masked Outbound
          </button>

          <button
            onClick={() => setActiveTab('original')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer',
              activeTab === 'original'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Raw Ingestion
          </button>

          {restoredText && (
            <button
              onClick={() => setActiveTab('restored')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer',
                activeTab === 'restored'
                  ? 'bg-card text-indiaGreen shadow-sm border border-indiaGreen/30'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Restored Response
            </button>
          )}

          {Object.keys(entityMapping).length > 0 && (
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer',
                activeTab === 'table'
                  ? 'bg-card text-saffron shadow-sm border border-saffron/30'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Vault Map ({Object.keys(entityMapping).length})
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'masked' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#37d3fc]" /> Sanitized Payload (Dispatched to External LLM)
            </span>
            <button
              onClick={() => handleCopy(sanitizedText)}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-indiaGreen" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? 'Copied' : 'Copy Payload'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-background/90 border border-border/80 font-mono text-xs sm:text-sm leading-relaxed text-foreground select-text min-h-[90px]">
            {renderInteractiveText(sanitizedText)}
          </div>

          <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#37d3fc] animate-pulse" />
            <span>
              All original sensitive identifiers are replaced with typed placeholders. Click any chip to inspect enclave mapping.
            </span>
          </div>
        </div>
      )}

      {activeTab === 'original' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">Raw Ingestion Prompt (Contains Sensitive Identifiers)</span>
          </div>
          <div className="p-4 rounded-xl bg-background/90 border border-destructive/30 font-mono text-xs sm:text-sm leading-relaxed text-foreground select-text min-h-[90px]">
            {originalText}
          </div>
        </div>
      )}

      {activeTab === 'restored' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-indiaGreen font-semibold">
              <Eye className="w-3.5 h-3.5 text-indiaGreen" /> Local In-Memory Reinserted Output
            </span>
            <button
              onClick={() => handleCopy(restoredText)}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-indiaGreen" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-background/90 border border-indiaGreen/30 font-mono text-xs sm:text-sm leading-relaxed text-foreground select-text min-h-[90px]">
            {restoredText}
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">
              AES-256-GCM Ephemeral Vault Mapping (Zero-Persistence In Enclave)
            </span>
          </div>

          <div className="border border-border/80 rounded-xl overflow-hidden">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-secondary/70 text-muted-foreground border-b border-border/80">
                <tr>
                  <th className="p-2.5">Placeholder Token</th>
                  <th className="p-2.5">Original Sensitive Value</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Vault Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Object.entries(entityMapping).map(([placeholder, originalVal], idx) => {
                  const style = getPlaceholderStyle(placeholder);
                  return (
                    <tr key={idx} className="hover:bg-background/50">
                      <td className="p-2.5 font-bold text-[#37d3fc] flex items-center gap-1.5">
                        {style.icon}
                        <span>{placeholder}</span>
                      </td>
                      <td className="p-2.5 text-foreground font-semibold">{originalVal}</td>
                      <td className="p-2.5 text-muted-foreground">{style.label}</td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[10px] border-indiaGreen/40 text-indiaGreen">
                          Encrypted (AES-GCM)
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaskedTextDisplay;
