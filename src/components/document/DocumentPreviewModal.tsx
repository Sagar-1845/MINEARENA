import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Table as TableIcon,
  Code2,
  Layers,
  Copy,
  Check,
  Download,
  Shield,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentFileItem } from '@/lib/document/types';
import { toast } from 'sonner';

interface DocumentPreviewModalProps {
  item: DocumentFileItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'nodes'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item || !item.extracted) return null;

  const doc = item.extracted;
  const preview = doc.previewData;

  const handleCopyText = () => {
    navigator.clipboard.writeText(doc.rawText);
    setCopied(true);
    toast.success('Extracted raw text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExtractedJson = () => {
    const jsonStr = JSON.stringify(doc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZEROLEAK_EXTRACT_${item.sanitizedName.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Extracted structured document JSON downloaded.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${item.sanitizedName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-3xl bg-[#070d24] border border-border/90 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 flex items-center justify-between gap-4 bg-card/60 backdrop-blur-xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-mono border-neon/50 text-neon">
                {doc.fileType}
              </Badge>
              <h3 className="font-bold text-sm sm:text-base text-foreground truncate max-w-md">
                {item.sanitizedName}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
              <span>Doc ID: {doc.docId}</span>
              <span>•</span>
              <span>{doc.nodes.length} Structured Nodes</span>
              <span>•</span>
              <span>{doc.metadata.wordCount} Words</span>
              <span>•</span>
              <span>{doc.metadata.extractionTimeMs} ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyText}
              className="text-xs font-mono border-border text-foreground hover:bg-secondary h-8 px-2.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline ml-1.5">Copy Text</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadExtractedJson}
              className="text-xs font-mono border-neon/40 text-neon hover:bg-neon/10 h-8 px-2.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1.5">Export JSON</span>
            </Button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-border/60 flex items-center gap-2 bg-[#050a1c]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-neon text-neon'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'nodes'
                ? 'border-neon text-neon'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Extracted Nodes ({doc.nodes.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#040817]">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Spreadsheet Table View */}
              {preview?.type === 'table' && preview.tableRows && (
                <div className="overflow-x-auto border border-border/80 rounded-2xl bg-card/60">
                  <table className="w-full text-xs font-mono text-left border-collapse">
                    {preview.tableHeaders && (
                      <thead className="bg-secondary/80 text-foreground border-b border-border">
                        <tr>
                          {preview.tableHeaders.map((hdr, idx) => (
                            <th key={idx} className="p-3 border-r border-border font-bold">
                              {hdr}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {preview.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-border/50 hover:bg-secondary/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-r border-border/50 text-foreground/80">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-2.5 text-[11px] font-mono text-muted-foreground text-center border-t border-border">
                    Showing first {preview.tableRows.length} rows. Cells mapped with spatial grid references.
                  </div>
                </div>
              )}

              {/* Image Preview View */}
              {preview?.type === 'image' && preview.imageUrl && (
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card/40">
                  <img
                    src={preview.imageUrl}
                    alt={item.sanitizedName}
                    className="max-h-72 object-contain rounded-xl border border-border mb-4"
                  />
                  <div className="w-full text-xs font-mono p-4 rounded-xl bg-background border border-border text-foreground">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">
                      OCR Extracted Text Output:
                    </span>
                    <pre className="whitespace-pre-wrap leading-relaxed">{doc.rawText || '(No text detected in image)'}</pre>
                  </div>
                </div>
              )}

              {/* Plain Text / PDF / DOCX / JSON View (Inert text rendering - NO raw HTML execution) */}
              {(preview?.type === 'text' || preview?.type === 'pdf') && (
                <div className="p-4 rounded-2xl border border-border/90 bg-card/40 text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap select-text">
                  {doc.rawText || '(Document content is empty)'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-mono flex items-center justify-between pb-2 border-b border-border/60">
                <span>Unified Document Intelligence Nodes</span>
                <span>Ready for Phase 3 Context-Aware NER</span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
                {doc.nodes.map((node, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-card/60 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neon/80 text-[11px] font-bold">#{idx + 1}</span>
                      <code className="text-saffron text-[11px] px-1.5 py-0.5 rounded bg-saffron/10 border border-saffron/20">
                        {node.ref}
                      </code>
                      <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground border-border">
                        {node.source}
                      </Badge>
                      {node.confidence !== undefined && (
                        <span className="text-[10px] text-purple-300">
                          conf: {node.confidence}
                        </span>
                      )}
                    </div>

                    <div className="text-foreground/90 truncate max-w-sm sm:max-w-md font-sans text-xs">
                      "{node.text}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/80 bg-[#050a1c] flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Parsed in sovereign memory sandbox. Zero network egress.</span>
          </span>
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs font-mono">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
