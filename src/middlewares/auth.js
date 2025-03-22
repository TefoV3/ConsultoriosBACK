import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';

export function authMiddleware(req, res, next) {
    const token = req.cookies?.access_token;
    let data = null;

    try {
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        
        // Verificar el token
        data = jwt.verify(token, SECRET_JWT_KEY);
        req.user = data;

        // Agregar mensaje de registro para verificar el Internal_ID
        console.log("🔍 Internal_ID obtenido en middleware:", data.id);

    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next();
}