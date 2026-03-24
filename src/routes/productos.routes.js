import { Router } from 'express';

const router = Router();

// Datos simulados (arreglo de objetos)
const productos = [
    { nombre: 'Revitalift', foto: 'revitalift.avif', votacion: 120 },
    { nombre: 'Elseve', foto: 'elseve.jpg', votacion: 98 },
    { nombre: 'Infallible', foto: 'infallible.jfif', votacion: 150 },
    { nombre: 'Elvive', foto: 'elvive.avif', votacion: 87 },
    { nombre: 'True Match', foto: 'truematch.webp', votacion: 110 },
    { nombre: 'Preference', foto: 'preference.jpg', votacion: 65 },
    { nombre: 'Men Expert', foto: 'menexpert.jpg', votacion: 45 },
    { nombre: 'Age Perfect', foto: 'ageperfect.webp', votacion: 72 },
    { nombre: 'Casting Creme', foto: 'castingcreme.webp', votacion: 90 },
    { nombre: 'Studio Line', foto: 'studioline.jpg', votacion: 30 }
];

// GET /api/productos
router.get('/', (req, res) => {
    res.json(productos);
});

export default router;
