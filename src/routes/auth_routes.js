import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Endpoint para verificar la sesión del usuario
router.get('/api/me', authMiddleware, (req, res) => {
  // El middleware authMiddleware decodifica el token y guarda la info en req.session.user
  if (req.session.user) {
    return res.json(req.session.user);
  }
  return res.status(401).json({ message: 'No autorizado' });
});

export default router;
