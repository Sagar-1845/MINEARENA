import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt,.csv,.xlsx,.json,.xml,.png,.jpg,.jpeg';

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFilesSelected,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input value so re-selecting the same file fires change event
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload document area. Drop files or press enter to browse."
      className={cn(
        'relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon',
        isDragActive
          ? 'border-neon bg-neon/10 scale-[1.005] shadow-[0_0_24px_rgba(55,211,252,0.25)]'
          : 'border-border/80 hover:border-neon/60 bg-card/60 hover:bg-card/90 backdrop-blur-xl shadow-xl',
        disabled && 'opacity-60 cursor-not-allowed pointer-events-none'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-4">
        {/* Animated Cyber Holographic Upload Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-card via-[#0a1f3d] to-card border border-border/90 flex items-center justify-center text-neon shadow-lg transition-transform group-hover:scale-105">
          <UploadCloud className="w-8 h-8 text-neon transition-colors group-hover:text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-saffron animate-pulse" />
        </div>

        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Drag & drop unstructured documents here, or{' '}
            <span className="text-neon underline underline-offset-4 decoration-neon/50 group-hover:decoration-neon">
              browse files
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body">
            Upload PDFs, DOCX, Spreadsheets, JSON, XML, or scanned images. All processing executes
            strictly inside sovereign client memory — zero outbound data transmission.
          </p>
        </div>

        {/* Accepted Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-2xl">
          <span className="text-[11px] font-mono text-muted-foreground mr-1">Supported:</span>
          {['PDF (Digital & Scanned)', 'DOCX', 'TXT', 'CSV', 'XLSX', 'JSON', 'XML', 'PNG', 'JPG'].map(
            (fmt) => (
              <Badge
                key={fmt}
                variant="outline"
                className="text-[10px] font-mono bg-secondary/50 border-border/80 text-foreground/90 py-0.5"
              >
                {fmt}
              </Badge>
            )
          )}
        </div>

        {/* Legacy OLE2 Notice */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/90 pt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>DOC & XLS legacy binary formats: Not supported in browser mode (convert to DOCX / XLSX).</span>
        </div>
      </div>
    </div>
  );
};
