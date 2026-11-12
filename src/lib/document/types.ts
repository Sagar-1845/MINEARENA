/**
 * src/lib/document/types.ts
 * ──────────────────────────
 * Unified Document Intelligence type definitions for Phase 2.
 */

export type DocumentSourceType =
  | 'digital_text'
  | 'ocr'
  | 'table_cell'
  | 'json_value'
  | 'xml_node'
  | 'metadata';

export interface DocumentNode {
  ref: string; // e.g. "page:1", "sheet:Sheet1!A1", "json:$.users[0].name", "table:1:row:2"
  text: string;
  start: number;
  end: number;
  source: DocumentSourceType;
  page?: number;
  confidence?: number;
}

export interface ExtractedDocument {
  docId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  nodes: DocumentNode[];
  rawText: string;
  metadata: {
    pageCount?: number;
    sheetNames?: string[];
    wordCount: number;
    extractionTimeMs: number;
    ocrPerformed: boolean;
    ocrConfidence?: number;
    author?: string;
    title?: string;
    createdAt?: string;
  };
  previewData?: {
    type: 'text' | 'table' | 'image' | 'pdf';
    textSample?: string;
    tableRows?: string[][];
    tableHeaders?: string[];
    imageUrl?: string;
    pdfPageSample?: string;
  };
}

export type ProcessingStatus = 'Queued' | 'Extracting' | 'Ready' | 'Failed';

export interface DocumentFileItem {
  id: string;
  file: File;
  name: string;
  sanitizedName: string;
  size: number;
  type: string;
  status: ProcessingStatus;
  progress: number;
  error?: string;
  extracted?: ExtractedDocument;
}

export interface ExtractionLimits {
  maxFileSize: number; // in bytes (e.g. 25MB)
  maxPdfPages: number; // e.g. 50 pages
  ocrTimeoutMs: number; // e.g. 30,000 ms
}

export const DEFAULT_EXTRACTION_LIMITS: ExtractionLimits = {
  maxFileSize: 25 * 1024 * 1024, // 25 MB
  maxPdfPages: 50,
  ocrTimeoutMs: 30000,
};
