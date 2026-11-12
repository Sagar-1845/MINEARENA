import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Shield,
  ShieldCheck,
  Sparkles,
  Play,
  Layers,
  Cpu,
  Info,
  AlertCircle,
  FileCheck2,
  Lock,
  Download,
  Terminal,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentUploadZone } from '@/components/document/DocumentUploadZone';
import { DocumentFileList } from '@/components/document/DocumentFileList';
import { DocumentPreviewModal } from '@/components/document/DocumentPreviewModal';
import { DocumentFileItem } from '@/lib/document/types';
import { extractUnifiedDocument } from '@/lib/document/extractors';
import { sanitizeFileName } from '@/lib/document/magicBytes';

const SPECIMEN_FIXTURES: {
  name: string;
  type: string;
  content: string;
  description: string;
}[] = [
  {
    name: 'Retail_Banking_Loan_Application.txt',
    type: 'text/plain',
    description: 'Banking KYC record with borrower Aarav Sharma, Aadhaar, PAN, phone and salary.',
    content: `LOAN SANCTION & CREDIT APPRAISAL DOSSIER
Reference ID: KYC-BLR-2026-9041
Branch: HSR Layout, Bengaluru

APPLICANT DETAILS:
Primary Borrower: Aarav Sharma
Identification Type: Aadhaar Card
Aadhaar Number: 2345 6789 0124
Income Tax Permanent Account Number (PAN): ABCDE1234F
Registered Mobile: +91 9876543210
Official Email: aarav.sharma@enterprise.in

FINANCIAL APPRAISAL:
Employer: TechNova Solutions Pvt Ltd
Monthly Net Remittance: INR 1,45,000
Bank Account: 50100234567891 (HDFC Bank Ltd)
Sanction Amount Requested: INR 45,00,000 for Residential Housing`,
  },
  {
    name: 'Clinical_Discharge_Summary.json',
    type: 'application/json',
    description: 'Structured clinical healthcare record with patient Priya Venkatesh and telemetry.',
    content: JSON.stringify(
      {
        hospital: 'Metropolitan Multispecialty Research Hospital',
        department: 'Cardiology',
        record_id: 'HOSP-CARD-2026-88',
        patient: {
          full_name: 'Priya Venkatesh',
          uidai: '3456 7890 1234',
          contact: '+91 9123456789',
          email: 'priya.v@example.com',
          age: 38,
        },
        clinical_notes: {
          admission_reason: 'Episodic palpitations and mild exertional dyspnea',
          ecg_telemetry: 'Paroxysmal supraventricular tachycardia (PSVT)',
          prescription: 'Metoprolol Tartrate 25mg BD, oral hydration',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Corporate_Vendor_Roster.csv',
    type: 'text/csv',
    description: 'B2B procurement table with GSTIN, director name, and settlement accounts.',
    content: `Vendor ID,Company Name,Signatory,GSTIN,Tax PAN,Contact Phone,Bank Account
VEND-001,Apex Logistics LLP,Rajesh Patel,29ABCDE1234F1Z5,BCDEF2345G,+91 9811223344,98765432109876
VEND-002,Zenith Infra Corp,Anita Rao,36FGHIJ5678K2Z8,FGHIJ5678K,+91 9822334455,12345678901234
VEND-003,Bharat Cloud Tech,Vikram Singh,07LMNOP9012Q3Z1,LMNOP9012Q,+91 9833445566,45678901234567`,
  },
];

export const DocumentIntelligencePage: React.FC = () => {
  const [fileQueue, setFileQueue] = useState<DocumentFileItem[]>([]);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<DocumentFileItem | null>(null);
  const [showAnalyzeInfoModal, setShowAnalyzeInfoModal] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const queueItems: DocumentFileItem[] = newFiles.map((file) => ({
      id: 'F-' + Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      sanitizedName: sanitizeFileName(file.name),
      size: file.size,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      status: 'Queued',
      progress: 0,
    }));

    setFileQueue((prev) => [...prev, ...queueItems]);

    // Process each file sequentially in sovereign client memory
    for (const item of queueItems) {
      updateItemState(item.id, { status: 'Extracting', progress: 20 });

      try {
        const extracted = await extractUnifiedDocument(item.file, undefined, (pct) => {
          updateItemState(item.id, { progress: pct });
        });

        updateItemState(item.id, {
          status: 'Ready',
          progress: 100,
          extracted,
        });

        toast.success(`Extracted "${item.sanitizedName}" (${extracted.nodes.length} nodes parsed).`);
      } catch (err: any) {
        updateItemState(item.id, {
          status: 'Failed',
          progress: 100,
          error: err?.message || 'Document extraction failed.',
        });
        toast.error(`Error parsing "${item.sanitizedName}"`, {
          description: err?.message || 'Document validation or extraction failed.',
        });
      }
    }
  };

  const updateItemState = (id: string, updates: Partial<DocumentFileItem>) => {
    setFileQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveFile = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileQueue([]);
    toast.info('Document queue cleared from memory.');
  };

  const handleLoadSpecimen = (fixture: typeof SPECIMEN_FIXTURES[0]) => {
    const blob = new Blob([fixture.content], { type: fixture.type });
    const file = new File([blob], fixture.name, { type: fixture.type });
    handleFilesSelected([file]);
  };

  const readyFilesCount = fileQueue.filter((f) => f.status === 'Ready').length;
  const isAnalyzeDisabled = readyFilesCount === 0;

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="border-neon/40 text-neon font-mono text-xs">
                <Cpu className="w-3.5 h-3.5 mr-1" /> UNIVERSAL DOCUMENT INGESTION ENGINE
              </Badge>
              <Badge variant="saffron" className="text-[10px] font-mono">
                Phase 2 Ingestion Active
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                Client-Side Memory Sandbox
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Universal Document Intelligence
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl font-body">
              Ingest unstructured documents (PDF, DOCX, Spreadsheets, JSON, XML, Images).
              Extracts paragraphs, tables, spreadsheet cells, and OCR text into a unified structure
              with zero external data transmission.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="saffron"
              size="lg"
              onClick={() => setShowAnalyzeInfoModal(true)}
              disabled={isAnalyzeDisabled}
              className={cn(
                'gap-2 font-mono text-xs sm:text-sm font-bold min-h-[44px] px-6 rounded-xl shadow-saffron-glow cursor-pointer',
                isAnalyzeDisabled && 'opacity-50 cursor-not-allowed shadow-none'
              )}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Selected Documents ({readyFilesCount})</span>
            </Button>
          </div>
        </div>

        {/* Specimen Dataset Launcher */}
        <div className="p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider">
              Quick Load Specimen Documents (Jury Benchmarks):
            </span>
            <span className="text-[11px] font-mono text-neon">Zero Manual Files Needed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SPECIMEN_FIXTURES.map((specimen, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSpecimen(specimen)}
                className="flex items-center gap-3 p-3.5 text-left rounded-xl bg-secondary/40 border border-border/80 hover:border-neon/60 hover:bg-secondary/70 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-neon group-hover:scale-105 transition-transform shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{specimen.name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {specimen.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <DocumentUploadZone onFilesSelected={handleFilesSelected} />

        {/* File Queue List */}
        <DocumentFileList
          files={fileQueue}
          onRemoveFile={handleRemoveFile}
          onPreviewFile={(item) => setSelectedPreviewItem(item)}
          onClearAll={handleClearAll}
        />

        {/* Preview Modal */}
        <DocumentPreviewModal
          item={selectedPreviewItem}
          onClose={() => setSelectedPreviewItem(null)}
        />

        {/* "Analyze" Status Notification Modal */}
        {showAnalyzeInfoModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          >
            <div className="w-full max-w-lg rounded-3xl bg-[#070d24] border border-border/90 p-6 sm:p-8 space-y-5 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mx-auto">
                <Info className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Extraction Complete // Detection Status
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                  <strong>{readyFilesCount} document(s)</strong> have been parsed into unified structural
                  nodes in client memory.
                </p>
                <div className="p-3.5 rounded-xl bg-secondary/80 border border-border text-xs font-mono text-neon/90 text-left">
                  <span>Notice:</span> Universal sensitive entity detection & context classification
                  is scheduled for <strong>Phase 3 (Universal Context-Aware NER Engine)</strong>.
                  In accordance with engineering integrity principles, no dummy or fake detection results
                  are simulated.
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="saffron"
                  onClick={() => setShowAnalyzeInfoModal(false)}
                  className="w-full font-mono text-xs font-bold h-10 rounded-xl"
                >
                  Understood
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentIntelligencePage;
