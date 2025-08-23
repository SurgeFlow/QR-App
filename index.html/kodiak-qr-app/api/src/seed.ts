import { PrismaClient } from '@prisma/client';
import { encryptJSON, sha256 } from './utils/crypto.js';
import path from 'path';
import { makeLabelPdf } from './utils/pdf.js';

const prisma = new PrismaClient();

function makeShortId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'K-';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function baseUrl() {
  return process.env.BASE_URL || 'http://localhost:3001';
}

async function main() {
  // wipe tables
  await prisma.serviceReport.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.equipment.deleteMany();

  const items = [
    { serialNumber: 'SN-1001', model: 'Door S20', location: 'Warehouse A' },
    { serialNumber: 'SN-1002', model: 'Door S20', location: 'Warehouse B' }
  ];

  for (const it of items) {
    const eq = await prisma.equipment.create({
      data: {
        shortId: makeShortId(),
        serialNumber: it.serialNumber,
        model: it.model,
        location: it.location
      }
    });

    const payload = {
      v: 1,
      equipmentId: eq.id,
      shortId: eq.shortId,
      issuedAt: new Date().toISOString(),
      checksum: sha256(eq.id + process.env.QR_SECRET!)
    };

    const token = encryptJSON(payload, process.env.QR_SECRET!);
    await prisma.qrCode.create({ data: { equipmentId: eq.id, encryptedToken: token } });

    const logoPath = process.env.LOGO_PATH || path.join(process.cwd(), '../assets/kodiak-logo.png');
    const outPath = path.join(process.cwd(), 'labels', `${eq.shortId}.pdf`);
    const url = `${baseUrl()}/report?token=${encodeURIComponent(token)}`;
    await makeLabelPdf({ url, shortId: eq.shortId, logoPath, outPath });
  }

  console.log('Seeded sample equipment and labels.');
}

main().finally(async () => prisma.$disconnect());