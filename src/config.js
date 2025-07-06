export const{
    PORT = 3000, // Puerto de la aplicación
    SALT_ROUNDS = 10, // Número de rondas para encriptar la contraseña
    SECRET_JWT_KEY = "este-es-la-clave-de-desarrollo-para-la-api-ltic-123-!@#$", // Clave secreta para JWT
    EMAIL_USER = "notificacionescjg@puce.edu.ec",
    EMAIL_PASS = "vvwyhmyjfkvsfnfs", // Contraseña de desarrador
} = process.env;