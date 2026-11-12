import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentFileItem } from '@/lib/document/types';

interface DocumentFileListProps {
  files: DocumentFileItem[];
  onRemoveFile: (id: string) => void;
  onPreviewFile: (item: DocumentFileItem) => void;
  onClearAll: () => void;
}

export const DocumentFileList: React.FC<DocumentFileListProps> = ({
  files,
  onRemoveFile,
  onPreviewFile,
  onClearAll,
}) => {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return <FileText className="w-4 h-4 text-rose-400" />;
    if (t.includes('docx') || t.includes('doc')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (t.includes('xlsx') || t.includes('csv'))
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    if (t.includes('json') || t.includes('xml')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (t.includes('png') || t.includes('jpg') || t.includes('jpeg'))
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const getStatusBadge = (status: DocumentFileItem['status'], error?: string) => {
    switch (status) {
      case 'Queued':
        return (
          <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
            QUEUED
          </Badge>
        );
      case 'Extracting':
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-neon/50 text-neon bg-neon/10 animate-pulse flex items-center gap-1"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            EXTRACTING
          </Badge>
        );
      case 'Ready':
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-emerald-500/50 text-emerald-300 bg-emerald-950/20 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            READY
          </Badge>
        );
      case 'Failed':
        return (
          <Badge
            variant="destructive"
            className="text-[10px] font-mono flex items-center gap-1"
            title={error}
          >
            <AlertTriangle className="w-3 h-3" />
            FAILED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neon" />
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Document Ingestion Queue ({files.length} document{files.length > 1 ? 's' : ''})
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs font-mono border-border/80 text-muted-foreground hover:text-destructive hover:border-destructive/40"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {files.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-border"
          >
            {/* File Info */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                {getFileIcon(item.type)}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[280px] sm:max-w-md">
                    {item.sanitizedName}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground py-0">
                    {item.type}
                  </Badge>
                  {getStatusBadge(item.status, item.error)}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  {item.extracted && (
                    <>
                      <span>•</span>
                      <span className="text-neon/90">
                        {item.extracted.nodes.length} structural nodes extracted
                      </span>
                      <span>•</span>
                      <span>{item.extracted.metadata.extractionTimeMs} ms</span>
                      {item.extracted.metadata.ocrPerformed && (
                        <>
                          <span>•</span>
                          <span className="text-purple-300">OCR Performed</span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Error Banner if Failed */}
                {item.error && (
                  <p className="text-xs text-rose-400 font-mono pt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.error}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar & Actions */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {item.status === 'Extracting' && (
                <div className="w-24 sm:w-32 bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-neon h-full transition-all duration-300 shadow-[0_0_8px_#37d3fc]"
                    style={{ width: `${Math.max(item.progress, 15)}%` }}
                  />
                </div>
              )}

              {item.status === 'Ready' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreviewFile(item)}
                  className="font-mono text-xs border-neon/40 text-neon hover:bg-neon/10 h-8 px-3"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Preview
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveFile(item.id)}
                aria-label={`Remove ${item.sanitizedName}`}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive border-border/80 hover:border-destructive/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
