import cors from 'cors';

export const corsMiddleware = () => cors({
  origin: 'http://localhost:5173', // Origen de la petición (Esta con el puerto de la app de VUE.JS) 
  credentials: true,               // Permite el envío de credenciales (cookies)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,internal-id, internal_user_id_student', //No borrar la cabecera internal-id, es necesaria para el manejo de auditoría
});
