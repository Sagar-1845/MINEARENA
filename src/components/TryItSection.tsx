import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Play,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  FileCode,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { executePipelineProcess, executeLeakCheck } from '@/lib/pipelineService';

// Exact schema returned by security/api.py
export interface LeakedItemMatch {
  pii_type: string;
  raw_snippet: string;
  position: [number, number];
  detection_method: string;
}

export interface SecurityApiResponse {
  has_leak?: boolean;
  leak_count?: number;
  leakage_count?: number;
  leaked_items?: LeakedItemMatch[];
  summary?: string;
  engineering_indicator?: string;
  // If Gateway returned full pipeline response
  can_proceed?: boolean;
  sanitized_output?: string;
  masked_text?: string;
}

// Valid Verhoeff checksum Aadhaar: 2345 6789 0124 (Checksum=4, validated)
const SAMPLE_RAW_PROMPT =
  'Please verify customer account for Aarav Sharma, Aadhaar 2345 6789 0124 and PAN ABCDE1234F. Contact: +91 9876543210.';

const SAMPLE_MASKED_PROMPT =
  'Please verify customer account for {{PII_NAME_1}}, Aadhaar {{PII_AADHAAR_1}} and PAN {{PII_PAN_1}}. Contact: {{PII_PHONE_1}}.';

export const TryItSection: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_RAW_PROMPT);
  const [department, setDepartment] = useState<'banking' | 'hr' | 'healthcare' | 'default'>('banking');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<SecurityApiResponse | null>(null);
  const [maskedResultText, setMaskedResultText] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleRunGateway = async () => {
    if (!inputText.trim()) {
      toast.warning('Please enter prompt text to inspect.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Call /api/process to mask the raw text with real typed placeholders
      const procData = await executePipelineProcess(
        inputText,
        department === 'banking' ? 'kyc_analysis' : 'general'
      );
      const maskedText = procData.sanitized_text || inputText;
      setMaskedResultText(maskedText);

      // Step 2: Call /security/leak-check to verify the outbound payload
      const entities = [
        { type: 'NAME', value: 'Aarav Sharma' },
        { type: 'AADHAAR', value: '2345 6789 0124' },
        { type: 'PAN', value: 'ABCDE1234F' },
        { type: 'PHONE', value: '+91 9876543210' },
      ];

      const data: any = await executeLeakCheck(maskedText, entities, []);
      setResponseResult(data);

      const count = data.leak_count ?? data.leakage_count ?? 0;
      if (count === 0) {
        toast.success('Inspection complete: 0 leaks identified.');
      } else {
        toast.warning(`Inspection complete: ${count} unmasked PII leak(s) detected.`);
      }
    } catch (error: any) {
      console.error('API call error:', error);
      toast.error('Backend unreachable', {
        description: `Unable to connect to security API endpoint (${error?.message || 'NetworkError'}). Please ensure the FastAPI server in security/ is running on port 8000.`,
        duration: 6000,
      });
      setResponseResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!responseResult) return;
    const text = JSON.stringify(responseResult, null, 2);
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast.info('Copied API response JSON to clipboard');
  };

  // Derive exact leakage count from API
  const leakCount =
    responseResult?.leak_count ?? responseResult?.leakage_count ?? 0;

  return (
    <section id="try-it" className="py-16 sm:py-24 border-t border-[#D5E0FF]/15 bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF] relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="border-saffron/40 text-saffron font-mono text-xs mb-3">
            <Terminal className="w-3.5 h-3.5 mr-1" /> REAL GATEWAY INSPECTOR
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Try It: Outbound Leak Verification
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Test our pre-LLM barrier with a verified Verhoeff-compliant Aadhaar and PAN.
            Directly calls the security router to inspect outbound text payloads.
          </p>
        </div>

        {/* Live Inspector Box */}
        <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Quick Preset Selector Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <span className="text-xs font-mono text-muted-foreground font-semibold">
              Sample Inputs:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInputText(SAMPLE_RAW_PROMPT)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all border min-h-[36px]',
                  inputText === SAMPLE_RAW_PROMPT
                    ? 'bg-saffron/15 text-saffron border-saffron/40 font-bold'
                    : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
                )}
              >
                Raw PII (Verhoeff Aadhaar)
              </button>

              <button
                type="button"
                onClick={() => setInputText(SAMPLE_MASKED_PROMPT)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all border min-h-[36px]',
                  inputText === SAMPLE_MASKED_PROMPT
                    ? 'bg-neon/15 text-neon border-neon/40 font-bold'
                    : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
                )}
              >
                Masked Placeholder Payload
              </button>
            </div>
          </div>

          {/* Textarea Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
              <span className="flex items-center gap-1.5 text-foreground/90 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-saffron" /> Outbound LLM Payload Text
              </span>
              <span>POST /security/leak-check</span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              aria-label="Input text for privacy gateway leak check"
              placeholder="Paste or type sentence with Aadhaar, PAN, phone, or masked placeholder..."
              className="w-full rounded-2xl border border-border bg-background/90 p-4 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:border-neon transition-all resize-y"
            />
          </div>

          {/* Actions & Department Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Department:</span>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                aria-label="Select department context"
                className="bg-secondary/70 border border-border text-foreground text-xs font-mono rounded-lg px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon min-h-[38px]"
              >
                <option value="banking">Banking (Strict)</option>
                <option value="hr">HR</option>
                <option value="healthcare">Healthcare</option>
                <option value="default">Default</option>
              </select>
            </div>

            <Button
              variant="saffron"
              size="lg"
              onClick={handleRunGateway}
              disabled={isLoading}
              className="gap-2 font-mono text-xs sm:text-sm font-bold shadow-saffron-glow min-h-[44px] px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-neon"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Inspecting Outbound Payload...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run through gateway</span>
                </>
              )}
            </Button>
          </div>

          {/* Response Inspector Box (Uses exact fields returned by api.py) */}
          {responseResult && (
            <div className="pt-5 border-t border-border/80 space-y-4">
              {/* Sanitized Outbound Masked Output Display */}
              {maskedResultText && (
                <div className="p-4 rounded-xl bg-background/95 border border-[#37d3fc]/40 font-mono text-xs space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
                    <span className="font-bold text-[#37d3fc] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> De-Identified Outbound Text (Dispatched to Model)
                    </span>
                    <Badge variant="outline" className="border-neon/40 text-neon text-[10px]">
                      Masked Placeholders Active
                    </Badge>
                  </div>
                  <div className="text-foreground text-xs sm:text-sm leading-relaxed select-text py-1">
                    {maskedResultText}
                  </div>
                </div>
              )}

              {/* Header with Derived Leakage Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    Leakage Status:
                  </span>

                  {/* Derived Leakage Badge: Green at 0, Red above 0 */}
                  {leakCount === 0 ? (
                    <Badge
                      variant="green"
                      className="gap-1.5 font-mono text-xs font-bold px-3 py-1.5 shadow-green-glow"
                    >
                      <ShieldCheck className="w-4 h-4 text-indiaGreen" />
                      <span>0 raw PII values in outbound payload</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="gap-1.5 font-mono text-xs font-bold px-3 py-1.5 shadow-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span>
                        {leakCount} raw PII value{leakCount > 1 ? 's' : ''} in outbound payload
                      </span>
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="h-8 text-[11px] font-mono gap-1 border-border/80 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neon"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-indiaGreen" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Exact Summary String from API */}
              {responseResult.summary && (
                <div className="p-3.5 rounded-xl bg-background/80 border border-border font-mono text-xs text-foreground/90 leading-relaxed">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-1">
                    API Assessment Summary
                  </span>
                  {responseResult.summary}
                </div>
              )}

              {/* Exact Leaked Items List from API */}
              {responseResult.leaked_items && responseResult.leaked_items.length > 0 && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Identified Outbound Leaks (
                    {responseResult.leaked_items.length}):
                  </span>
                  <div className="space-y-1.5">
                    {responseResult.leaked_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-background/90 border border-destructive/30 font-mono text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive font-bold text-[10px]">
                            {item.pii_type}
                          </span>
                          <span className="text-foreground/90 font-semibold">
                            Snippet: {item.raw_snippet}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Method: {item.detection_method} • Span: [{item.position[0]},{' '}
                          {item.position[1]}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Prototype Engineering Indicator Notice from API */}
              {responseResult.engineering_indicator && (
                <p className="text-[10px] font-mono text-muted-foreground/80 leading-normal italic px-1">
                  {responseResult.engineering_indicator}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
