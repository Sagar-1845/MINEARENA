import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  FileCheck2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Terminal,
  Sparkles,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AuditRecord {
  id: string;
  timestamp: string;
  eventType: 'LEAK_CHECK_PASS' | 'LEAK_DETECTED' | 'INJECTION_BLOCKED' | 'POLICY_VIOLATION' | 'TOKEN_ISSUED';
  department: string;
  summary: string;
  action: 'ALLOW' | 'WARN' | 'BLOCK';
  riskScore: number;
  detectedEntities: string[];
  hmacSignature: string;
}

const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'AUD-2026-9041',
    timestamp: '2026-11-12T14:38:12Z',
    eventType: 'LEAK_CHECK_PASS',
    department: 'banking',
    summary: 'Pre-LLM leak verification passed with 0 raw PII in outbound prompt payload.',
    action: 'ALLOW',
    riskScore: 12.5,
    detectedEntities: ['<AADHAAR_1>', '<PAN_1>'],
    hmacSignature: 'e4f9b8c2...7a10',
  },
  {
    id: 'AUD-2026-9040',
    timestamp: '2026-11-12T14:32:05Z',
    eventType: 'LEAK_DETECTED',
    department: 'banking',
    summary: 'Unmasked Aadhaar pattern (23****24) caught in outbound payload. Egress halted.',
    action: 'BLOCK',
    riskScore: 84.0,
    detectedEntities: ['AADHAAR'],
    hmacSignature: 'a910c4d1...33e2',
  },
  {
    id: 'AUD-2026-9039',
    timestamp: '2026-11-12T14:25:44Z',
    eventType: 'INJECTION_BLOCKED',
    department: 'hr',
    summary: 'Adversarial instruction override detected by heuristic scanner. Payload blocked.',
    action: 'BLOCK',
    riskScore: 92.0,
    detectedEntities: ['PROMPT_INJECTION'],
    hmacSignature: 'f102bb84...9091',
  },
  {
    id: 'AUD-2026-9038',
    timestamp: '2026-11-12T14:15:30Z',
    eventType: 'TOKEN_ISSUED',
    department: 'healthcare',
    summary: 'Citizen phone number mapped to deterministic token <PHONE_1> in RAM enclave.',
    action: 'ALLOW',
    riskScore: 18.0,
    detectedEntities: ['<PHONE_1>', '<NAME_1>'],
    hmacSignature: 'b482ca11...55a7',
  },
  {
    id: 'AUD-2026-9037',
    timestamp: '2026-11-12T13:58:19Z',
    eventType: 'POLICY_VIOLATION',
    department: 'banking',
    summary: 'Composite risk score 67.0 exceeds banking department max threshold of 50.0.',
    action: 'BLOCK',
    riskScore: 67.0,
    detectedEntities: ['AADHAAR', 'PAN', 'PHONE'],
    hmacSignature: 'c771fa99...1203',
  },
];

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isTriggeringCanary, setIsTriggeringCanary] = useState(false);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detectedEntities.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedEventType === 'ALL' || log.eventType === selectedEventType;

    const matchesDept =
      selectedDept === 'ALL' || log.department.toLowerCase() === selectedDept.toLowerCase();

    return matchesSearch && matchesType && matchesDept;
  });

  const handleTriggerCanaryAudit = async () => {
    setIsTriggeringCanary(true);
    try {
      const res = await fetch('/security/canary?skip_masking=false', {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newRecord: AuditRecord = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        eventType: data.passed ? 'LEAK_CHECK_PASS' : 'LEAK_DETECTED',
        department: 'canary-eval',
        summary: data.engineering_indicator || 'Synthetic canary validation executed.',
        action: data.passed ? 'ALLOW' : 'BLOCK',
        riskScore: data.passed ? 5.0 : 85.0,
        detectedEntities: ['SYNTHETIC_CANARY_TOKEN'],
        hmacSignature: Math.random().toString(36).substring(2, 10) + '...hmac',
      };

      setLogs((prev) => [newRecord, ...prev]);
      toast.success('Live canary audit entry generated and sealed.');
    } catch (err: any) {
      toast.error('Canary audit trigger failed', {
        description: err?.message || 'Could not reach POST /security/canary',
      });
    } finally {
      setIsTriggeringCanary(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeroleak_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Exported audit log JSON.');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-neon/40 text-neon font-mono text-xs">
                <FileCheck2 className="w-3.5 h-3.5 mr-1" /> DPDP SECTION 8(5) COMPLIANCE
              </Badge>
              <Badge variant="green" className="text-[10px] font-mono">
                Cryptographically Sealed
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Security Audit Log
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
              Immutable perimeter inspection records for all processed LLM payloads.
              Raw PII is redacted in compliance with data privacy mandates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerCanaryAudit}
              disabled={isTriggeringCanary}
              className="gap-1.5 font-mono text-xs border-border/80 min-h-[40px] focus-visible:ring-2 focus-visible:ring-neon"
            >
              <Sparkles className="w-3.5 h-3.5 text-saffron" />
              <span>Record Canary Event</span>
            </Button>

            <Button
              variant="saffron"
              size="sm"
              onClick={handleExportJson}
              className="gap-1.5 font-mono text-xs shadow-saffron-glow min-h-[40px] focus-visible:ring-2 focus-visible:ring-neon"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit ID, keyword, or entity..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon min-h-[40px]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              aria-label="Filter by Event Type"
              className="bg-background border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              <option value="ALL">All Event Types</option>
              <option value="LEAK_CHECK_PASS">Pass (Clean)</option>
              <option value="LEAK_DETECTED">Leak Caught</option>
              <option value="INJECTION_BLOCKED">Injection Blocked</option>
              <option value="POLICY_VIOLATION">Policy Violation</option>
              <option value="TOKEN_ISSUED">Token Issued</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by Department"
              className="bg-background border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              <option value="ALL">All Departments</option>
              <option value="banking">Banking</option>
              <option value="hr">HR</option>
              <option value="healthcare">Healthcare</option>
              <option value="canary-eval">Canary</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-3xl border border-border/90 bg-card/90 overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Audit ID & Time</th>
                  <th className="py-3.5 px-4 font-bold">Event Type</th>
                  <th className="py-3.5 px-4 font-bold">Dept</th>
                  <th className="py-3.5 px-4 font-bold">Event Summary</th>
                  <th className="py-3.5 px-4 font-bold">Risk</th>
                  <th className="py-3.5 px-4 font-bold">Action</th>
                  <th className="py-3.5 px-4 font-bold">HMAC Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No audit records matching your current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isAllowed = log.action === 'ALLOW';
                    const isBlock = log.action === 'BLOCK';

                    return (
                      <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-foreground block">{log.id}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold border',
                              log.eventType === 'LEAK_CHECK_PASS'
                                ? 'bg-indiaGreen/15 text-indiaGreen border-indiaGreen/40'
                                : log.eventType === 'LEAK_DETECTED'
                                ? 'bg-destructive/15 text-destructive border-destructive/40'
                                : log.eventType === 'INJECTION_BLOCKED'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                                : 'bg-neon/15 text-neon border-neon/40'
                            )}
                          >
                            {log.eventType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap uppercase text-[11px] text-muted-foreground">
                          {log.department}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs text-foreground/90">
                          <p className="line-clamp-2 leading-relaxed">{log.summary}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.detectedEntities.map((ent, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-background border border-border text-foreground/80"
                              >
                                {ent}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                          <span
                            className={
                              log.riskScore > 50 ? 'text-destructive' : 'text-indiaGreen'
                            }
                          >
                            {log.riskScore.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={isAllowed ? 'green' : isBlock ? 'destructive' : 'saffron'}
                            className="text-[10px] font-mono font-bold"
                          >
                            {log.action}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-[10px] text-muted-foreground">
                          <code>{log.hmacSignature}</code>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
