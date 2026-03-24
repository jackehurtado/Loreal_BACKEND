import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// GET /api/productos-db
router.get('/', async (req, res) => {
    try {
        
        const [rows] = await pool.query(
            'SELECT nombre, foto, votacion FROM productos'
        );

        
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar MySQL Railway' });
    }
});

export default router;
