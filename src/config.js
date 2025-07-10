export const{
    PORT = 3000, // Puerto de la aplicación
    //JWT MANAGEMENT
    SALT_ROUNDS = 10, // Número de rondas para encriptar la contraseña
    SECRET_JWT_KEY = "este-es-la-clave-de-desarrollo-para-la-api-ltic-123-!@#$", // Clave secreta para JWT
    //MAIL MANAGEMENT
    EMAIL_SERVICE = "gmail", // Servicio de correo: 'gmail', 'hotmail', 'outlook', 'custom'
    EMAIL_HOST = "smtp.gmail.com", // Servidor SMTP - smtp.gmail.com o smtp-mail.outlook.com o smtp.office365.com
    EMAIL_PORT = 465, // Puerto SMTP: 587 (TLS), 465 (SSL), 25 (no seguro)
    EMAIL_SECURE = true, // true para puerto 465 (SSL), false para 587 (TLS) o 25
    EMAIL_USER = "email@gmail.com", // Correo electrónico donde se enviarán las notificaciones
    EMAIL_PASS = "contraseña de desarrollodor", // Contraseña de aplicación para el correo electrónico
    EMAIL_TLS_REJECT_UNAUTHORIZED = false, // Para certificados auto-firmados o desarrollo
} = process.env;