// ============================================================
// Express API — persists dashboard state to data/dashboard.json
// ============================================================

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'dashboard.json');
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '{}\n', 'utf-8');
  }
}

app.get('/api/state', async (_req, res) => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw || '{}'));
  } catch (err) {
    console.error('Failed to read state:', err);
    res.status(500).json({ error: 'Failed to read state' });
  }
});

app.put('/api/state', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2) + '\n', 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save state:', err);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

if (isProduction) {
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

await ensureDataFile();
app.listen(PORT, () => {
  console.log(`Dashboard API running at http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
