import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import usuariosRoutes from './routes/usuarios.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') }); 

const app = express();        
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET all products
app.get('/api/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single product by id
app.get('/api/productos/:id', (req, res) => {
  db.query('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// POST - insert new product
app.post('/api/productos', (req, res) => {
  const { nombre, foto, votacion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre is required' });
  db.query(
    'INSERT INTO productos (nombre, foto, votacion) VALUES (?, ?, ?)',
    [nombre, foto || null, votacion || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, nombre, foto, votacion: votacion || 0 });
    }
  );
});

// PUT - full update of a product
app.put('/api/productos/:id', (req, res) => {
  const { nombre, foto, votacion } = req.body;
  db.query(
    'UPDATE productos SET nombre = ?, foto = ?, votacion = ? WHERE id = ?',
    [nombre, foto, votacion, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ id: req.params.id, nombre, foto, votacion });
    }
  );
});

// PATCH - partial update (e.g. just increment vote)
app.patch('/api/productos/:id', (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: 'No fields provided' });
  const setClause = keys.map(k => `${k} = ?`).join(', ');   // ← backticks
  const values = [...Object.values(fields), req.params.id];
  db.query(
    `UPDATE productos SET ${setClause} WHERE id = ?`,        // ← backticks
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Updated', id: req.params.id, ...fields });
    }
  );
});

// DELETE - remove product by id
app.delete('/api/productos/:id', (req, res) => {
  db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', id: req.params.id });
  });
});

app.use(express.static(join(__dirname, '../public')));
app.use('/api/usuarios', usuariosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // ← backticks