import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { decryptToken, sha256 } from '../utils/crypto.js';

const prisma = new PrismaClient();
const router = Router();

// uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.createHash('sha256').update(file.originalname + Date.now().toString()).digest('hex').slice(0, 16);
    cb(null, `${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/jpeg|image\/png/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG/PNG allowed'), ok);
  }
});

router.get('/report', async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const payload = decryptToken(token, process.env.QR_SECRET!);
    // minimal validation
    const checksum = sha256(payload.equipmentId + process.env.QR_SECRET!);
    if (checksum !== payload.checksum) return res.status(400).json({ error: 'Invalid token' });

    const equipment = await prisma.equipment.findUnique({ where: { id: payload.equipmentId } });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

    return res.json({ ok: true, shortId: equipment.shortId });
  } catch (e: any) {
    return res.status(400).json({ error: 'Invalid token' });
  }
});

router.post('/report', upload.array('photos', 5), async (req, res) => {
  const token = String(req.body.token || '');
  const description = String(req.body.description || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const payload = decryptToken(token, process.env.QR_SECRET!);
    const checksum = sha256(payload.equipmentId + process.env.QR_SECRET!);
    if (checksum !== payload.checksum) return res.status(400).json({ error: 'Invalid token' });

    const filePaths = (req.files as Express.Multer.File[] | undefined)?.map(f => `/uploads/${f.filename}`) || [];
    const report = await prisma.serviceReport.create({
      data: {
        equipmentId: payload.equipmentId,
        tokenSnapshot: token,
        description,
        photoPaths: JSON.stringify(filePaths)
      }
    });
    res.json({ ok: true, reportId: report.id });
  } catch (e: any) {
    return res.status(400).json({ error: 'Invalid token' });
  }
});

export default router;