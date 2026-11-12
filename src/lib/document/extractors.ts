/**
 * src/lib/document/extractors.ts
 * ──────────────────────────────
 * Real, client-side, multi-format document extraction engine for Phase 2.
 * Extracts paragraphs, headings, tables, metadata, spreadsheet cells,
 * JSON/XML structures, and image text via OCR into a unified DocumentNode structure.
 */

import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';
import {
  DocumentNode,
  ExtractedDocument,
  DEFAULT_EXTRACTION_LIMITS,
  ExtractionLimits,
} from './types';
import { validateFileMagicBytes, sanitizeFileName } from './magicBytes';

// Configure PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Extracts digital text and layout nodes from PDF documents.
 * Falls back to OCR if the document contains scanned raster pages.
 */
export async function extractTextFromPdf(
  file: File,
  limits: ExtractionLimits = DEFAULT_EXTRACTION_LIMITS,
  onProgress?: (pct: number) => void
): Promise<{ nodes: DocumentNode[]; rawText: string; pageCount: number; ocrPerformed: boolean; ocrConfidence?: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = Math.min(pdf.numPages, limits.maxPdfPages);
  const nodes: DocumentNode[] = [];
  const textParts: string[] = [];
  let currentOffset = 0;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onProgress) onProgress(Math.round((pageNum / pageCount) * 80));

    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings: string[] = [];

    for (const item of content.items as any[]) {
      if (item.str && item.str.trim()) {
        const str = item.str.trim();
        pageStrings.push(str);

        const start = currentOffset;
        const end = start + str.length;
        currentOffset = end + 1; // +1 for space/newline

        nodes.push({
          ref: `pdf:page_${pageNum}:item_${nodes.length + 1}`,
          text: str,
          start,
          end,
          source: 'digital_text',
          page: pageNum,
        });
      }
    }

    const pageFullText = pageStrings.join(' ');
    if (pageFullText) textParts.push(pageFullText);
  }

  const rawText = textParts.join('\n\n');

  // Check if PDF is a scanned image (almost zero digital text extracted)
  if (rawText.length < 25 && pageCount > 0) {
    if (onProgress) onProgress(85);

    try {
      // Render first page to offscreen canvas and run OCR
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const ocrFile = new File([blob], 'scanned_page_1.png', { type: 'image/png' });
          const ocrResult = await extractTextFromImage(ocrFile, limits);

          return {
            nodes: ocrResult.nodes.map((n) => ({ ...n, page: 1 })),
            rawText: ocrResult.rawText,
            pageCount,
            ocrPerformed: true,
            ocrConfidence: ocrResult.confidence,
          };
        }
      }
    } catch (_) {
      // OCR fallback error, return digital text
    }
  }

  return { nodes, rawText, pageCount, ocrPerformed: false };
}

/**
 * Extracts text from PNG / JPEG images using Tesseract.js (English + Hindi models).
 */
export async function extractTextFromImage(
  file: File,
  limits: ExtractionLimits = DEFAULT_EXTRACTION_LIMITS,
  onProgress?: (pct: number) => void
): Promise<{ nodes: DocumentNode[]; rawText: string; confidence: number }> {
  const workerPromise = (async () => {
    const worker = await createWorker('eng+hin', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 90));
        }
      },
    });

    const ret = await worker.recognize(file);
    await worker.terminate();
    return ret;
  })();

  // Timeout guard for OCR processing
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`OCR processing timed out after ${limits.ocrTimeoutMs / 1000}s`)), limits.ocrTimeoutMs)
  );

  const ret = await Promise.race([workerPromise, timeoutPromise]);
  const nodes: DocumentNode[] = [];
  let currentOffset = 0;

  for (const block of ret.data.blocks || []) {
    for (const paragraph of block.paragraphs || []) {
      const text = paragraph.text?.trim();
      if (text) {
        const start = currentOffset;
        const end = start + text.length;
        currentOffset = end + 1;

        nodes.push({
          ref: `image:ocr_block_${nodes.length + 1}`,
          text,
          start,
          end,
          source: 'ocr',
          confidence: Math.round(paragraph.confidence) / 100,
        });
      }
    }
  }

  return {
    nodes,
    rawText: ret.data.text.trim(),
    confidence: Math.round(ret.data.confidence) / 100,
  };
}

/**
 * Extracts paragraphs and tables from Microsoft Word (.docx) documents.
 */
export async function extractTextFromDocx(
  file: File
): Promise<{ nodes: DocumentNode[]; rawText: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value.trim();

  const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0);
  const nodes: DocumentNode[] = [];
  let currentOffset = 0;

  paragraphs.forEach((p, idx) => {
    const start = currentOffset;
    const end = start + p.length;
    currentOffset = end + 1;

    nodes.push({
      ref: `docx:paragraph_${idx + 1}`,
      text: p.trim(),
      start,
      end,
      source: 'digital_text',
    });
  });

  return { nodes, rawText };
}

/**
 * Extracts tabular data and cell coordinates from XLSX and CSV files.
 */
export async function extractTextFromSpreadsheet(
  file: File
): Promise<{
  nodes: DocumentNode[];
  rawText: string;
  sheetNames: string[];
  tableHeaders: string[];
  tableRows: string[][];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const nodes: DocumentNode[] = [];
  const textParts: string[] = [];
  let currentOffset = 0;
  let firstSheetHeaders: string[] = [];
  const firstSheetRows: string[][] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // Convert sheet to json array of arrays
    const sheetData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (sheetData.length === 0) continue;

    if (firstSheetHeaders.length === 0 && sheetData[0]) {
      firstSheetHeaders = sheetData[0].map((h) => String(h || ''));
      for (let r = 1; r < Math.min(sheetData.length, 12); r++) {
        if (sheetData[r]) {
          firstSheetRows.push(sheetData[r].map((c) => String(c ?? '')));
        }
      }
    }

    // Extract cell coordinates
    for (let r = 0; r < sheetData.length; r++) {
      const row = sheetData[r];
      if (!row) continue;

      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          const str = String(val).trim();
          const colLetter = XLSX.utils.encode_col(c);
          const cellRef = `${colLetter}${r + 1}`;

          const start = currentOffset;
          const end = start + str.length;
          currentOffset = end + 1;

          nodes.push({
            ref: `sheet:${sheetName}!${cellRef}`,
            text: str,
            start,
            end,
            source: 'table_cell',
          });
          textParts.push(str);
        }
      }
    }
  }

  return {
    nodes,
    rawText: textParts.join(' | '),
    sheetNames: workbook.SheetNames,
    tableHeaders: firstSheetHeaders,
    tableRows: firstSheetRows,
  };
}

/**
 * Extracts recursive key-value tree nodes from JSON documents.
 */
export async function extractTextFromJson(
  file: File
): Promise<{ nodes: DocumentNode[]; rawText: string }> {
  const content = await file.text();
  const parsed = JSON.parse(content);

  const nodes: DocumentNode[] = [];
  let currentOffset = 0;

  function traverse(obj: any, path: string) {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      const str = String(obj);
      const start = currentOffset;
      const end = start + str.length;
      currentOffset = end + 1;

      nodes.push({
        ref: `json:${path}`,
        text: str,
        start,
        end,
        source: 'json_value',
      });
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => traverse(item, `${path}[${idx}]`));
      return;
    }

    if (typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        traverse(val, path === '$' ? `$.${key}` : `${path}.${key}`);
      }
    }
  }

  traverse(parsed, '$');
  return { nodes, rawText: content };
}

/**
 * Extracts XML element nodes safely with external entity resolution disabled.
 */
export async function extractTextFromXml(
  file: File
): Promise<{ nodes: DocumentNode[]; rawText: string }> {
  const content = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, 'application/xml');

  // Check for parser error
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML parsing failed: malformed document syntax.');
  }

  const nodes: DocumentNode[] = [];
  let currentOffset = 0;

  function walk(node: Node, path: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue?.trim();
      if (val) {
        const start = currentOffset;
        const end = start + val.length;
        currentOffset = end + 1;

        nodes.push({
          ref: `xml:${path}`,
          text: val,
          start,
          end,
          source: 'xml_node',
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as Element;
      const elemPath = `${path}/${elem.tagName}`;

      // Attributes
      for (let i = 0; i < elem.attributes.length; i++) {
        const attr = elem.attributes[i];
        if (attr.value?.trim()) {
          const val = attr.value.trim();
          nodes.push({
            ref: `xml:${elemPath}[@${attr.name}]`,
            text: val,
            start: currentOffset,
            end: currentOffset + val.length,
            source: 'xml_node',
          });
          currentOffset += val.length + 1;
        }
      }

      // Children
      node.childNodes.forEach((child) => walk(child, elemPath));
    }
  }

  walk(xmlDoc.documentElement, '');
  return { nodes, rawText: content };
}

/**
 * Extracts plain text line-by-line.
 */
export async function extractTextFromPlainText(
  file: File
): Promise<{ nodes: DocumentNode[]; rawText: string }> {
  const content = await file.text();
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const nodes: DocumentNode[] = [];
  let currentOffset = 0;

  lines.forEach((line, idx) => {
    const text = line.trim();
    const start = currentOffset;
    const end = start + text.length;
    currentOffset = end + 1;

    nodes.push({
      ref: `txt:line_${idx + 1}`,
      text,
      start,
      end,
      source: 'digital_text',
    });
  });

  return { nodes, rawText: content };
}

/**
 * Universal Extraction Dispatcher:
 * Validates, dispatches to the corresponding extractor, and formats preview data.
 */
export async function extractUnifiedDocument(
  file: File,
  limits: ExtractionLimits = DEFAULT_EXTRACTION_LIMITS,
  onProgress?: (pct: number) => void
): Promise<ExtractedDocument> {
  const startTime = performance.now();
  const sanitizedName = sanitizeFileName(file.name);

  // 1. Magic bytes validation
  const validation = await validateFileMagicBytes(file, limits.maxFileSize);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed.');
  }

  const format = validation.detectedFormat;
  let nodes: DocumentNode[] = [];
  let rawText = '';
  let pageCount: number | undefined;
  let sheetNames: string[] | undefined;
  let ocrPerformed = false;
  let ocrConfidence: number | undefined;
  let previewData: ExtractedDocument['previewData'];

  if (format === 'pdf') {
    const pdfRes = await extractTextFromPdf(file, limits, onProgress);
    nodes = pdfRes.nodes;
    rawText = pdfRes.rawText;
    pageCount = pdfRes.pageCount;
    ocrPerformed = pdfRes.ocrPerformed;
    ocrConfidence = pdfRes.ocrConfidence;
    previewData = {
      type: 'pdf',
      textSample: rawText.slice(0, 800),
      pdfPageSample: `Page 1 of ${pageCount}`,
    };
  } else if (format === 'png' || format === 'jpeg') {
    const imgRes = await extractTextFromImage(file, limits, onProgress);
    nodes = imgRes.nodes;
    rawText = imgRes.rawText;
    ocrPerformed = true;
    ocrConfidence = imgRes.confidence;
    previewData = {
      type: 'image',
      textSample: rawText.slice(0, 800),
      imageUrl: URL.createObjectURL(file),
    };
  } else if (format === 'docx') {
    const docxRes = await extractTextFromDocx(file);
    nodes = docxRes.nodes;
    rawText = docxRes.rawText;
    previewData = {
      type: 'text',
      textSample: rawText.slice(0, 800),
    };
  } else if (format === 'xlsx' || format === 'csv') {
    const sheetRes = await extractTextFromSpreadsheet(file);
    nodes = sheetRes.nodes;
    rawText = sheetRes.rawText;
    sheetNames = sheetRes.sheetNames;
    previewData = {
      type: 'table',
      tableHeaders: sheetRes.tableHeaders,
      tableRows: sheetRes.tableRows,
      textSample: rawText.slice(0, 800),
    };
  } else if (format === 'json') {
    const jsonRes = await extractTextFromJson(file);
    nodes = jsonRes.nodes;
    rawText = jsonRes.rawText;
    previewData = {
      type: 'text',
      textSample: rawText.slice(0, 800),
    };
  } else if (format === 'xml') {
    const xmlRes = await extractTextFromXml(file);
    nodes = xmlRes.nodes;
    rawText = xmlRes.rawText;
    previewData = {
      type: 'text',
      textSample: rawText.slice(0, 800),
    };
  } else {
    // txt / fallback
    const txtRes = await extractTextFromPlainText(file);
    nodes = txtRes.nodes;
    rawText = txtRes.rawText;
    previewData = {
      type: 'text',
      textSample: rawText.slice(0, 800),
    };
  }

  const elapsed = Math.round((performance.now() - startTime) * 10) / 10;
  const wordCount = rawText ? rawText.trim().split(/\s+/).length : 0;

  return {
    docId: 'DOC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    fileName: sanitizedName,
    fileType: format.toUpperCase(),
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    nodes,
    rawText,
    metadata: {
      pageCount,
      sheetNames,
      wordCount,
      extractionTimeMs: elapsed,
      ocrPerformed,
      ocrConfidence,
    },
    previewData,
  };
}
