import cors from 'cors';

export const corsMiddleware = () => cors({
  origin: 'http://localhost:5173', // Origen de la petición 
  credentials: true,               // Permite el envío de credenciales (cookies)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
});
