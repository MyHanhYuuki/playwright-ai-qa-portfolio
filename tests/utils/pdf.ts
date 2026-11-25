import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Download, TestInfo } from '@playwright/test';
import { EVIDENCE_ENABLED } from './evidence';

/**
 * Text pieces of a SauceDemo PDF receipt, in file order (SD-103 test-data.md "Cách đọc chữ trong file PDF").
 * Content streams are FlateDecode; each text is a hex array of a TJ operator, e.g. [<537761> 10 <67>] TJ = "Swag".
 * No PDF library needed. Fonts are WinAnsi, so only Latin-1 text is readable (Vietnamese is out of scope, IMP-05).
 */
export function pdfTexts(buf: Buffer): string[] {
  const raw = buf.toString('latin1');
  const texts: string[] = [];
  let from = 0;
  for (;;) {
    const at = raw.indexOf('stream', from);
    if (at < 0) break;
    let start = at + 'stream'.length;
    if (raw[start] === '\r') start++;
    if (raw[start] === '\n') start++;
    const end = raw.indexOf('endstream', start);
    if (end < 0) break;
    let content = '';
    try {
      content = zlib.inflateSync(buf.subarray(start, end)).toString('latin1');
    } catch {
      // not a compressed stream (e.g. image / metadata): skip
    }
    for (const m of content.matchAll(/\[(.*?)\]\s*TJ/gs)) {
      texts.push([...m[1].matchAll(/<([0-9a-fA-F]*)>/g)].map((h) => Buffer.from(h[1], 'hex').toString('latin1')).join(''));
    }
    from = end + 'endstream'.length;
  }
  return texts;
}

/**
 * The expected texts that are found IN ORDER in the PDF (longest matching prefix of `expected`).
 * Compare the result with `expected`: the diff shows the first text that is missing or out of order.
 */
export function inOrder(texts: readonly string[], expected: readonly string[]) {
  const found: string[] = [];
  let i = 0;
  for (const t of texts) if (i < expected.length && t === expected[i]) found.push(expected[i++]);
  return found;
}

/**
 * Read a downloaded receipt: file name, size, texts.
 * The file is attached to the report, and saved next to the screenshots when evidence is on (TC-035: the human opens it).
 */
export async function readReceipt(download: Download, info: TestInfo, evidenceDir?: string) {
  const file = await download.path();
  const buf = fs.readFileSync(file);
  const name = download.suggestedFilename();
  await info.attach(name, { path: file, contentType: 'application/pdf' });
  if (EVIDENCE_ENABLED && evidenceDir) {
    fs.mkdirSync(evidenceDir, { recursive: true });
    await download.saveAs(path.join(evidenceDir, name));
  }
  return { name, size: buf.length, texts: pdfTexts(buf) };
}
