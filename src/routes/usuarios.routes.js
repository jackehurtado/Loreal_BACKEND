import { Router } from 'express';
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'loreal_secret_key_2026';

// Middleware: verificar JWT
function authMiddleware(req, res, next) {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token requerido' });
      try {
              req.usuario = jwt.verify(token, JWT_SECRET);
              next();
      } catch {
              res.status(401).json({ error: 'Token invalido o expirado' });
      }
}

// POST /api/usuarios/registro
router.post('/registro', async (req, res) => {
      const { nombre, email, password, rol } = req.body;
      if (!nombre || !email || !password) {
              return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
      }
      try {
              const password_hash = await bcrypt.hash(password, 10);
              const [result] = await pool.query(
                        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
                        [nombre, email, password_hash, rol || 'usuario']
                      );
              res.status(201).json({ message: 'Usuario creado', id: result.insertId });
      } catch (error) {
              if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: 'El email ya esta registrado' });
              }
              console.error(error);
              res.status(500).json({ error: 'Error al crear usuario' });
      }
});

// POST /api/usuarios/login
router.post('/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
              return res.status(400).json({ error: 'Email y password son requeridos' });
      }
      try {
              const [rows] = await pool.query(
                        'SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE email = ? AND activo = 1',
                        [email]
                      );
              if (rows.length === 0) {
                        return res.status(401).json({ error: 'Credenciales invalidas' });
              }
              const usuario = rows[0];
              const passwordOk = await bcrypt.compare(password, usuario.password_hash);
              if (!passwordOk) {
                        return res.status(401).json({ error: 'Credenciales invalidas' });
              }
              const token = jwt.sign(
                  { id: usuario.id, email: usuario.email, rol: usuario.rol },
                        JWT_SECRET,
                  { expiresIn: '8h' }
                      );
              res.json({
                        message: 'Login exitoso',
                        token,
                        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
              });
      } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error en el login' });
      }
});

// GET /api/usuarios (protegido)
router.get('/', authMiddleware, async (req, res) => {
      try {
              const [rows] = await pool.query(
                        'SELECT id, nombre, email, rol, activo, created_at FROM usuarios'
                      );
              res.json(rows);
      } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error al consultar usuarios' });
      }
});

// PUT /api/usuarios/:id (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
      const { id } = req.params;
      const { nombre, email, rol, activo } = req.body;
      try {
              const [result] = await pool.query(
                        'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
                        [nombre, email, rol, activo, id]
                      );
              if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
              }
              res.json({ message: 'Usuario actualizado' });
      } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error al actualizar usuario' });
      }
});

// DELETE /api/usuarios/:id (soft delete, protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
      const { id } = req.params;
      try {
              const [result] = await pool.query(
                        'UPDATE usuarios SET activo = 0 WHERE id = ?', [id]
                      );
              if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
              }
              res.json({ message: 'Usuario desactivado' });
      } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error al eliminar usuario' });
      }
});

export default router;
