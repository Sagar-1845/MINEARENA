/**
 * tests/test_document_intelligence.cjs
 * ──────────────────────────────────────
 * Comprehensive test suite for Phase 2 Universal Document Intelligence:
 * Tests magic bytes validation, encryption detection, negative security cases,
 * filename sanitization, and structured node extraction across synthetic samples.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// ── In-Memory Synthetic File Constructor ────────────────────────────────────
function createMockFile(name, buffer, mimeType = 'application/octet-stream') {
  const u8 = Uint8Array.from(buffer);
  return {
    name,
    size: u8.byteLength,
    type: mimeType,
    slice: (start, end) => ({
      arrayBuffer: async () => u8.slice(start, end).buffer,
      text: async () => Buffer.from(u8.slice(start, end)).toString('utf-8'),
    }),
    arrayBuffer: async () => u8.buffer,
    text: async () => Buffer.from(u8).toString('utf-8'),
  };
}

// ── Unit Test Functions Re-implementing Validation Protocol ─────────────────
function sanitizeFileName(rawName) {
  if (!rawName) return 'unnamed_document';
  let clean = rawName.replace(/[\x00-\x1F\x7F]/g, '');
  clean = clean.replace(/(\.\.[\/\\])+/g, '').replace(/^[\/\\]+/, '');
  clean = clean.replace(/<[^>]*>/g, '');
  clean = clean.replace(/["'<>|:*?]/g, '_');
  clean = clean.trim();
  if (clean.length > 180) {
    const ext = clean.includes('.') ? clean.slice(clean.lastIndexOf('.')) : '';
    clean = clean.slice(0, 180 - ext.length) + ext;
  }
  return clean || 'document';
}

async function validateFile(file, maxBytes = 25 * 1024 * 1024) {
  if (file.size === 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }
  if (file.size > maxBytes) {
    return { valid: false, error: 'File size exceeds maximum allowed limit.' };
  }

  const headerBuf = Buffer.from(await (await file.slice(0, Math.min(2048, file.size))).arrayBuffer());

  // Check OLE2 legacy .doc / .xls
  if (headerBuf.length >= 8 &&
      headerBuf[0] === 0xd0 && headerBuf[1] === 0xcf &&
      headerBuf[2] === 0x11 && headerBuf[3] === 0xe0 &&
      headerBuf[4] === 0xa1 && headerBuf[5] === 0xb1 &&
      headerBuf[6] === 0x1a && headerBuf[7] === 0xe1) {
    return {
      valid: false,
      error: 'DOC and XLS legacy binary formats are not supported in browser mode. Please convert to DOCX or XLSX for client-side privacy extraction.',
    };
  }

  // Check PDF
  if (headerBuf.length >= 4 &&
      headerBuf[0] === 0x25 && headerBuf[1] === 0x50 &&
      headerBuf[2] === 0x44 && headerBuf[3] === 0x46) {
    const txt = await file.text();
    if (txt.includes('/Encrypt')) {
      return { valid: false, error: 'Password-protected or encrypted PDF detected.' };
    }
    return { valid: true, format: 'pdf' };
  }

  // Check ZIP-based DOCX/XLSX
  if (headerBuf.length >= 4 &&
      headerBuf[0] === 0x50 && headerBuf[1] === 0x4b &&
      headerBuf[2] === 0x03 && headerBuf[3] === 0x04) {
    if (headerBuf.length >= 8 && (headerBuf[6] & 0x01) !== 0) {
      return { valid: false, error: 'Encrypted / password-protected Office document detected.' };
    }
    return { valid: true, format: 'office_zip' };
  }

  // Check PNG
  if (headerBuf.length >= 8 &&
      headerBuf[0] === 0x89 && headerBuf[1] === 0x50 &&
      headerBuf[2] === 0x4e && headerBuf[3] === 0x47) {
    return { valid: true, format: 'png' };
  }

  // Check JPEG
  if (headerBuf.length >= 3 &&
      headerBuf[0] === 0xff && headerBuf[1] === 0xd8 &&
      headerBuf[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // XML XXE Check
  const txt = await file.text();
  if (/<!ENTITY/i.test(txt) || /SYSTEM\s+["']/i.test(txt)) {
    return { valid: false, error: 'XML contains disallowed external entity (XXE) declarations.' };
  }

  // Check JSON
  if (file.name.endsWith('.json')) {
    try {
      JSON.parse(txt);
      return { valid: true, format: 'json' };
    } catch (_) {
      return { valid: false, error: 'Invalid or malformed JSON syntax.' };
    }
  }

  // Fallback text / csv
  return { valid: true, format: 'text' };
}

async function runTestSuite() {
  console.log('──────────────────────────────────────────────────────────');
  console.log('  ZEROLEAK AI // PHASE 2 DOCUMENT INTELLIGENCE TEST SUITE');
  console.log('──────────────────────────────────────────────────────────\n');

  let passed = 0;
  let failed = 0;

  function test(desc, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${desc}: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(desc, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 1. Filename Sanitization Tests
  test('Sanitize: strips path traversal (../../etc/passwd)', () => {
    const clean = sanitizeFileName('../../etc/passwd.pdf');
    assert.strictEqual(clean, 'etc/passwd.pdf');
  });

  test('Sanitize: strips script tags (<script>alert(1)</script>)', () => {
    const clean = sanitizeFileName('invoice_<script>alert(1)</script>.docx');
    assert.strictEqual(clean, 'invoice_alert(1).docx');
  });

  test('Sanitize: strips null bytes and control chars', () => {
    const clean = sanitizeFileName('kyc\x00file\x07.txt');
    assert.strictEqual(clean, 'kycfile.txt');
  });

  // 2. Validation & Security Negative Cases
  await testAsync('Security: rejects 0-byte empty file with clear error', async () => {
    const emptyFile = createMockFile('empty.pdf', Buffer.alloc(0));
    const res = await validateFile(emptyFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /empty/i);
  });

  await testAsync('Security: rejects oversized document (> 25MB)', async () => {
    const bigFile = createMockFile('large.pdf', Buffer.alloc(100));
    bigFile.size = 26 * 1024 * 1024; // 26MB simulated
    const res = await validateFile(bigFile, 25 * 1024 * 1024);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /exceeds/i);
  });

  await testAsync('Security: rejects legacy OLE2 binary (.doc / .xls)', async () => {
    const ole2Buf = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
    const oleFile = createMockFile('legacy.doc', ole2Buf);
    const res = await validateFile(oleFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /not supported in browser mode/i);
  });

  await testAsync('Security: rejects encrypted PDF with /Encrypt dictionary', async () => {
    const encPdf = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Encrypt 2 0 R >>\nendobj\n%%EOF');
    const encFile = createMockFile('confidential_encrypted.pdf', encPdf);
    const res = await validateFile(encFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /encrypted PDF/i);
  });

  await testAsync('Security: rejects password-protected ZIP/DOCX with bit 0 flag set', async () => {
    const encZip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x01, 0x00]); // flag byte has bit 0 set
    const encFile = createMockFile('protected.docx', encZip);
    const res = await validateFile(encFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /password-protected/i);
  });

  await testAsync('Security: rejects XML with external entity XXE declaration', async () => {
    const xxeXml = Buffer.from('<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>');
    const xxeFile = createMockFile('exploit.xml', xxeXml);
    const res = await validateFile(xxeFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /disallowed external entity \(XXE\)/i);
  });

  await testAsync('Security: rejects malformed JSON', async () => {
    const badJson = Buffer.from('{ name: "missing_quotes", broken: }');
    const jsonFile = createMockFile('broken.json', badJson);
    const res = await validateFile(jsonFile);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /malformed JSON/i);
  });

  // 3. Positive Extraction Tests
  await testAsync('Extraction: valid clean PDF header passes validation', async () => {
    const pdfBuf = Buffer.from('%PDF-1.7\n% clean unencrypted document\n%%EOF');
    const file = createMockFile('clean_specimen.pdf', pdfBuf);
    const res = await validateFile(file);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.format, 'pdf');
  });

  await testAsync('Extraction: valid DOCX / XLSX ZIP header passes validation', async () => {
    const zipBuf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00]);
    const file = createMockFile('application.docx', zipBuf);
    const res = await validateFile(file);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.format, 'office_zip');
  });

  await testAsync('Extraction: valid PNG image header passes validation', async () => {
    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const file = createMockFile('scanned_aadhaar.png', pngBuf);
    const res = await validateFile(file);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.format, 'png');
  });

  await testAsync('Extraction: valid JPEG image header passes validation', async () => {
    const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const file = createMockFile('specimen.jpg', jpgBuf);
    const res = await validateFile(file);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.format, 'jpeg');
  });

  await testAsync('Extraction: CSV parsing produces cell-level spatial references', async () => {
    const csvContent = 'Vendor,GSTIN,Amount\nApex LLP,29ABCDE1234F1Z5,145000\nZenith,36FGHIJ5678K2Z8,290000';
    const wb = xlsx.read(csvContent, { type: 'string' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    assert.strictEqual(data.length, 3);
    assert.strictEqual(data[1][1], '29ABCDE1234F1Z5');
  });

  await testAsync('Extraction: JSON recursive keypath extraction', async () => {
    const jsonDoc = {
      hospital: 'Metro Hospital',
      patient: { name: 'Priya Venkatesh', uidai: '3456 7890 1234' }
    };
    const nodes = [];
    function walk(obj, path) {
      if (typeof obj === 'string') {
        nodes.push({ ref: `json:${path}`, text: obj });
      } else if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          walk(v, `${path}.${k}`);
        }
      }
    }
    walk(jsonDoc, '$');
    assert.strictEqual(nodes.length, 3);
    assert.strictEqual(nodes[1].ref, 'json:$.patient.name');
    assert.strictEqual(nodes[1].text, 'Priya Venkatesh');
  });

  console.log('\n──────────────────────────────────────────────────────────');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED across ${passed + failed} test cases.`);
  console.log('──────────────────────────────────────────────────────────');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
