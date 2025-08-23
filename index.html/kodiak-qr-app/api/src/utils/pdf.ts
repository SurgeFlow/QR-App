import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { makeQrPngBuffer } from './qr.js';

export async function makeLabelPdf(options: {
  url: string;
  shortId: string;
  logoPath: string;
  outPath: string;
}) {
  const { url, shortId, logoPath, outPath } = options;
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  const qrPng = await makeQrPngBuffer(url);

  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // Title
  doc.fontSize(16).text('Kodiak Equipment Services, Inc.', { align: 'center' });
  doc.moveDown(0.5);

  // QR image centered
  const qrWidth = 256;
  const pageWidth = doc.page.width;
  const x = (pageWidth - qrWidth) / 2;
  const y = 120;
  doc.image(qrPng, x, y, { width: qrWidth });

  // Logo under the QR
  try {
    const logoStat = await fs.promises.stat(logoPath);
    if (logoStat.isFile()) {
      doc.moveDown();
      doc.image(logoPath, (pageWidth - 180) / 2, y + qrWidth + 20, { width: 180 });
    }
  } catch (e) {
    // ignore if logo missing
  }

  // Short ID text at bottom
  doc.fontSize(14).text(`ID: ${shortId}`, { align: 'center', baseline: 'bottom' });

  doc.end();
  return new Promise<string>((resolve) => {
    stream.on('finish', () => resolve(outPath));
  });
}