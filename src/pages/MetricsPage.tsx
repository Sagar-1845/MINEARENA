import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BarChart3,
  Shield,
  ShieldAlert,
  Target,
  RefreshCw,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DepartmentPolicy {
  max_allowed_risk_score: number;
  block_on_injection: boolean;
  max_masked_entities: number;
  blocked_pii_types: string[];
  always_mask: string[];
  strict_leak_check: boolean;
}

const fetchPolicies = async (): Promise<Record<string, DepartmentPolicy>> => {
  const res = await fetch('/security/policies');
  if (!res.ok) {
    throw new Error(`Failed to fetch /security/policies: HTTP ${res.status}`);
  }
  return res.json();
};

export const MetricsPage: React.FC = () => {
  const [canaryResult, setCanaryResult] = useState<any>(null);
  const [isTestingCanary, setIsTestingCanary] = useState(false);

  // TanStack Query for department policies from real API
  const {
    data: policies,
    isLoading: policiesLoading,
    isError: policiesError,
    refetch: refetchPolicies,
    isFetching: policiesFetching,
  } = useQuery({
    queryKey: ['securityPolicies'],
    queryFn: fetchPolicies,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleRunCanaryEvaluation = async () => {
    setIsTestingCanary(true);
    try {
      const res = await fetch('/security/canary?skip_masking=false', {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setCanaryResult(data);
      toast.success('Live canary evaluation executed successfully.');
    } catch (err: any) {
      toast.error('Canary evaluation failed', {
        description: err?.message || 'Could not connect to /security/canary',
      });
    } finally {
      setIsTestingCanary(false);
    }
  };

  const deptList = policies ? Object.entries(policies) : [];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-neon/40 text-neon font-mono text-xs">
                <BarChart3 className="w-3.5 h-3.5 mr-1" /> RUNTIME METRICS & POLICY AUDIT
              </Badge>
              <Badge variant="saffron" className="text-[10px] font-mono">
                Member 3 Intelligence
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Gateway Telemetry & Policies
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
              Real-time operational indicators and department governance parameters fetched
              directly from <code className="text-foreground/90 font-mono text-xs">security/policies.json</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchPolicies()}
              disabled={policiesFetching}
              className="gap-1.5 font-mono text-xs border-border/80 min-h-[40px] focus-visible:ring-2 focus-visible:ring-neon"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', policiesFetching && 'animate-spin text-neon')} />
              <span>Refresh Policies</span>
            </Button>

            <Button
              variant="saffron"
              size="sm"
              onClick={handleRunCanaryEvaluation}
              disabled={isTestingCanary}
              className="gap-1.5 font-mono text-xs shadow-saffron-glow min-h-[40px] focus-visible:ring-2 focus-visible:ring-neon"
            >
              {isTestingCanary ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Run Pipeline Canary</span>
            </Button>
          </div>
        </div>

        {/* Live Telemetry Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {/* Card 1: PII Leakage Count */}
          <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indiaGreen/15 text-indiaGreen flex items-center justify-center border border-indiaGreen/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <Badge variant="green" className="text-[10px] font-mono">
                ZERO LEAK TARGET
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
              PII Leak Count
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono mt-1">
              {canaryResult ? canaryResult.details?.leak_count ?? 0 : 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Unmasked sensitive items detected in outbound payloads.
            </p>
          </div>

          {/* Card 2: Canary Verification Status */}
          <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neon/15 text-neon flex items-center justify-center border border-neon/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Badge variant="neon" className="text-[10px] font-mono">
                PIPELINE STATUS
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
              Canary Status
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono mt-1 truncate">
              {canaryResult?.details?.status || 'BARRIER READY'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              End-to-end pipeline leak barrier integrity.
            </p>
          </div>

          {/* Card 3: Department Policies Count */}
          <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center border border-saffron/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <Badge variant="saffron" className="text-[10px] font-mono">
                DEPARTMENTS
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
              Configured Policies
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono mt-1">
              {policies ? Object.keys(policies).length : 4}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Active departmental rule profiles in policies.json.
            </p>
          </div>

          {/* Card 4: Canary Test Entities */}
          <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center border border-border">
                <Target className="w-5 h-5 text-neon" />
              </div>
              <Badge variant="outline" className="border-border text-[10px] font-mono">
                FIXTURES
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
              Canary Entities
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono mt-1">
              {canaryResult?.details?.synthetic_entities_tested ?? 6}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Synthetic PII entities validated during canary sweep.
            </p>
          </div>
        </div>

        {/* Real Department Security Policies Table */}
        <div className="rounded-3xl border border-border/90 bg-card/90 p-5 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-saffron" />
                <span>Active Department Governance Policies</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact security parameters enforced by <code className="font-mono text-xs">evaluate_pre_payload_stage()</code> across sectors.
              </p>
            </div>
            <Badge variant="outline" className="border-border font-mono text-xs">
              GET /security/policies
            </Badge>
          </div>

          {policiesLoading ? (
            <div className="py-8 text-center text-muted-foreground font-mono text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neon" />
              <span>Fetching department policies from API...</span>
            </div>
          ) : policiesError ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
              Unable to load policies from backend. Please ensure the server is running on port 8000.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Department</th>
                    <th className="py-3 px-4 font-bold">Max Risk Score</th>
                    <th className="py-3 px-4 font-bold">Block Injection</th>
                    <th className="py-3 px-4 font-bold">Strict Leak Check</th>
                    <th className="py-3 px-4 font-bold">Blocked PII Types</th>
                    <th className="py-3 px-4 font-bold">Mandatory Masking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deptList.map(([deptName, policy]) => (
                    <tr key={deptName} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground uppercase">
                        {deptName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-saffron">
                        {policy.max_allowed_risk_score.toFixed(1)} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold border',
                            policy.block_on_injection
                              ? 'bg-indiaGreen/15 text-indiaGreen border-indiaGreen/40'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {String(policy.block_on_injection)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold border',
                            policy.strict_leak_check
                              ? 'bg-neon/15 text-neon border-neon/40'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {String(policy.strict_leak_check)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {policy.blocked_pii_types.length === 0 ? (
                            <span className="text-muted-foreground text-[10px]">None</span>
                          ) : (
                            policy.blocked_pii_types.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30 text-[10px] font-bold"
                              >
                                {t}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {policy.always_mask.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded bg-secondary border border-border text-foreground/80 text-[10px]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
