import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import productosRoutes from './routes/productos.routes.js';
import productosDbRoutes from './routes/productos.db.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, '../public')));

app.use('/api/productos', productosRoutes);
app.use('/api/productos-db', productosDbRoutes);
app.use('/api/usuarios', usuariosRoutes);

// DEV ONLY: write file endpoint
app.post('/dev/write-file', (req, res) => {
    const { filePath, content } = req.body;
    if (!filePath || !content) return res.status(400).json({ error: 'filePath and content required' });
    try {
          fs.writeFileSync(filePath, content, 'utf8');
          res.json({ ok: true, written: filePath });
    } catch (e) {
          res.status(500).json({ error: e.message });
    }
});

export default app;
