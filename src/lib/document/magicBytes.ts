/**
 * src/lib/document/magicBytes.ts
 * ──────────────────────────────
 * High-assurance magic bytes validation, format identification,
 * encryption detection, and filename sanitization.
 */

import { DEFAULT_EXTRACTION_LIMITS } from './types';

/**
 * Sanitizes untrusted user filenames to prevent directory traversal,
 * null byte injection, and XSS rendering exploits.
 */
export function sanitizeFileName(rawName: string): string {
  if (!rawName) return 'unnamed_document';

  // 1. Strip null bytes and control characters
  let clean = rawName.replace(/[\x00-\x1F\x7F]/g, '');

  // 2. Strip directory path traversal sequences (../, ..\, etc.)
  clean = clean.replace(/(\.\.[\/\\])+/g, '').replace(/^[\/\\]+/, '');

  // 3. Strip HTML tags / script injection
  clean = clean.replace(/<[^>]*>/g, '');

  // 4. Strip dangerous filename characters
  clean = clean.replace(/["'<>|:*?]/g, '_');

  // 5. Trim whitespace and limit length
  clean = clean.trim();
  if (clean.length > 180) {
    const ext = clean.includes('.') ? clean.slice(clean.lastIndexOf('.')) : '';
    clean = clean.slice(0, 180 - ext.length) + ext;
  }

  return clean || 'document';
}

export interface ValidationResult {
  valid: boolean;
  detectedFormat: string;
  error?: string;
}

/**
 * Validates a file using true magic byte signatures and structural checks.
 */
export async function validateFileMagicBytes(
  file: File,
  maxSizeBytes: number = DEFAULT_EXTRACTION_LIMITS.maxFileSize
): Promise<ValidationResult> {
  // 1. Check file size
  if (file.size === 0) {
    return {
      valid: false,
      detectedFormat: 'empty',
      error: 'File is empty (0 bytes).',
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    const fileMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      detectedFormat: 'oversized',
      error: `File size (${fileMb} MB) exceeds the maximum allowed limit of ${maxMb} MB.`,
    };
  }

  // 2. Read first 2KB for magic signature inspection
  const headerSlice = file.slice(0, Math.min(2048, file.size));
  const headerBuffer = await headerSlice.arrayBuffer();
  const bytes = new Uint8Array(headerBuffer);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // Check for OLE2 Compound Document (legacy .doc, .xls, .ppt)
  // D0 CF 11 E0 A1 B1 1A E1
  if (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 &&
    bytes[5] === 0xb1 &&
    bytes[6] === 0x1a &&
    bytes[7] === 0xe1
  ) {
    return {
      valid: false,
      detectedFormat: 'ole2_legacy',
      error:
        'DOC and XLS legacy binary formats are not supported in browser mode. Please convert to DOCX or XLSX for client-side privacy extraction.',
    };
  }

  // Check for PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    // Check for PDF encryption by scanning for /Encrypt in header / trailer
    const fullTextSlice = await file.slice(0, Math.min(file.size, 16384)).text();
    const tailSlice = await file.slice(Math.max(0, file.size - 4096), file.size).text();
    if (fullTextSlice.includes('/Encrypt') || tailSlice.includes('/Encrypt')) {
      return {
        valid: false,
        detectedFormat: 'pdf_encrypted',
        error:
          'Password-protected or encrypted PDF detected. Please provide an unencrypted document copy.',
      };
    }

    return { valid: true, detectedFormat: 'pdf' };
  }

  // Check for ZIP-based container (DOCX, XLSX, etc.): PK\x03\x04
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    // Check for encrypted ZIP entry: general purpose bit flag 0 (byte offset 6 & 7)
    if (bytes.length >= 8 && (bytes[6] & 0x01) !== 0) {
      return {
        valid: false,
        detectedFormat: 'zip_encrypted',
        error:
          'Encrypted / password-protected Office document detected. Please remove password protection before processing.',
      };
    }

    if (ext === 'docx') return { valid: true, detectedFormat: 'docx' };
    if (ext === 'xlsx') return { valid: true, detectedFormat: 'xlsx' };

    return { valid: true, detectedFormat: 'zip_office' };
  }

  // Check for PNG: \x89PNG\r\n\x1a\n
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: 'png' };
  }

  // Check for JPEG: \xFF\xD8\xFF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, detectedFormat: 'jpeg' };
  }

  // Text-based files (JSON, XML, CSV, TXT)
  // Ensure no binary null characters exist in the initial 512 bytes
  let isBinary = false;
  for (let i = 0; i < Math.min(bytes.length, 512); i++) {
    if (bytes[i] === 0x00) {
      isBinary = true;
      break;
    }
  }

  if (isBinary) {
    return {
      valid: false,
      detectedFormat: 'unknown_binary',
      error: `Unsupported or corrupt binary file format. Expected PDF, DOCX, XLSX, TXT, CSV, JSON, XML, or Image.`,
    };
  }

  // Validate text content
  const textContent = await file.slice(0, Math.min(file.size, 4096)).text();
  const trimmed = textContent.trim();

  // JSON detection
  if (ext === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      // Validate small files or check first chunk syntax
      if (file.size < 1000000) {
        JSON.parse(await file.text());
      }
      return { valid: true, detectedFormat: 'json' };
    } catch (_) {
      return {
        valid: false,
        detectedFormat: 'json_corrupt',
        error: 'Invalid or malformed JSON syntax.',
      };
    }
  }

  // XML detection
  if (ext === 'xml' || trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    // Check for XXE external entity injection attempts in the header
    if (/<!ENTITY/i.test(textContent) || /SYSTEM\s+["']/i.test(textContent)) {
      return {
        valid: false,
        detectedFormat: 'xml_xxe_risk',
        error: 'XML contains disallowed external entity (XXE) declarations.',
      };
    }
    return { valid: true, detectedFormat: 'xml' };
  }

  // CSV detection
  if (ext === 'csv') {
    return { valid: true, detectedFormat: 'csv' };
  }

  // Plain Text fallback
  if (ext === 'txt' || ext === 'log' || ext === 'md') {
    return { valid: true, detectedFormat: 'txt' };
  }

  // If extension is known supported image extension but magic bytes failed
  if (['png', 'jpg', 'jpeg'].includes(ext)) {
    return {
      valid: false,
      detectedFormat: 'image_corrupt',
      error: 'Corrupt or unreadable image file header.',
    };
  }

  // Default text format if clean
  return { valid: true, detectedFormat: 'txt' };
}
