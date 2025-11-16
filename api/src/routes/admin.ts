import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import path from 'path';
import { encryptJSON, sha256 } from '../utils/crypto.js';
import { makeLabelPdf } from '../utils/pdf.js';

const prisma = new PrismaClient();
const router = Router();

const CreateEquipmentSchema = z.object({
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  installedAt: z.string().datetime().optional(),
  notes: z.string().optional()
});

function makeShortId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'K-';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:3001';
}

function makeTokenPayload(equipmentId: string, shortId: string) {
  const secret = process.env.QR_SECRET!;
  return {
    v: 1,
    equipmentId,
    shortId,
    issuedAt: new Date().toISOString(),
    checksum: sha256(equipmentId + secret)
  };
}

router.post('/equipment', async (req, res) => {
  const parse = CreateEquipmentSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const shortId = makeShortId();
  const equipment = await prisma.equipment.create({
    data: {
      shortId,
      serialNumber: parse.data.serialNumber,
      model: parse.data.model,
      location: parse.data.location,
      installedAt: parse.data.installedAt ? new Date(parse.data.installedAt) : undefined,
      notes: parse.data.notes
    }
  });

  const payload = makeTokenPayload(equipment.id, equipment.shortId);
  const token = encryptJSON(payload, process.env.QR_SECRET!);
  await prisma.qrCode.create({
    data: { equipmentId: equipment.id, encryptedToken: token }
  });

  const url = `${getBaseUrl()}/report?token=${encodeURIComponent(token)}`;
  const logoPath = process.env.LOGO_PATH || path.join(process.cwd(), '../assets/kodiak-logo.png');
  const outPath = path.join(process.cwd(), 'labels', `${equipment.shortId}.pdf`);
  const pdfPath = await makeLabelPdf({ url, shortId: equipment.shortId, logoPath, outPath });

  return res.json({
    equipment,
    labelUrl: `/labels/${equipment.shortId}.pdf`,
    token
  });
});

router.get('/equipment', async (_req, res) => {
  const equipment = await prisma.equipment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { qrcodes: true }
  });
  res.json(equipment);
});

router.get('/equipment/:id', async (req, res) => {
  const id = req.params.id;
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: { qrcodes: true, reports: true }
  });
  if (!equipment) return res.status(404).json({ error: 'Not found' });
  res.json(equipment);
});

router.post('/equipment/:id/reprint', async (req, res) => {
  const id = req.params.id;
  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (!equipment) return res.status(404).json({ error: 'Not found' });

  const qr = await prisma.qrCode.findFirst({ where: { equipmentId: id }, orderBy: { createdAt: 'desc' }});
  const token = qr?.encryptedToken;
  if (!token) return res.status(400).json({ error: 'No token found' });

  const url = `${process.env.BASE_URL || 'http://localhost:3001'}/report?token=${encodeURIComponent(token)}`;
  const logoPath = process.env.LOGO_PATH || path.join(process.cwd(), '../assets/kodiak-logo.png');
  const outPath = path.join(process.cwd(), 'labels', `${equipment.shortId}.pdf`);
  await makeLabelPdf({ url, shortId: equipment.shortId, logoPath, outPath });

  return res.json({ labelUrl: `/labels/${equipment.shortId}.pdf` });
});

router.get('/reports', async (req, res) => {
  const status = (req.query.status as string | undefined) || undefined;
  const where = status ? { status } : {};
  const reports = await prisma.serviceReport.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  res.json(reports);
});

router.patch('/reports/:id', async (req, res) => {
  const id = req.params.id;
  const data: any = {};
  if ('status' in req.body) data.status = String(req.body.status);
  if ('internalNotes' in req.body) data.internalNotes = String(req.body.internalNotes);
  const updated = await prisma.serviceReport.update({ where: { id }, data });
  res.json(updated);
});

export default router;