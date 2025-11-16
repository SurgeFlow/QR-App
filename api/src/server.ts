import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import fs from 'fs';
import { ensureDatabase } from './utils/database.js';

const app = express();

await ensureDatabase();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// static
const uploadsPath = path.join(process.cwd(), 'uploads');
const labelsPath = path.join(process.cwd(), 'labels');
const publicPath = path.join(process.cwd(), 'src', 'public');
fs.mkdirSync(uploadsPath, { recursive: true });
fs.mkdirSync(labelsPath, { recursive: true });

app.use('/uploads', express.static(uploadsPath));
app.use('/labels', express.static(labelsPath));
app.use('/public', express.static(publicPath));

// Rate limit public report posting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});
app.use('/api/report', limiter);

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Serve the public report page at /report (HTML)
app.get('/report', (req, res) => {
  res.sendFile(path.join(publicPath, 'report.html'));
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});