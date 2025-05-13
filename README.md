# ⚖️ Consultorios Jurídicos Backend

Bienvenido al backend de **Consultorios Jurídicos**. Este proyecto provee una API RESTful para la gestión de usuarios, consultas, horarios, asistencias y parámetros administrativos de un sistema de consultorios jurídicos universitarios.

---

## 📁 Estructura del Proyecto

```
ConsultoriosBACK/
│
├── .env
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── config.js
│   ├── index.js
│   ├── cloudinary.js
│   ├── sessionData.js
│   ├── controllers/
│   ├── database/
│   ├── docs/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   └── ...
└── ...
```

---

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

El archivo `.env` contiene las credenciales de conexión a la base de datos (Solo si se quiere usar el programa en la NUBE). Ejemplo:

```
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=usuario
SUPABASE_DB_PASSWORD=contraseña
SUPABASE_HOST=host
SUPABASE_PORT=puerto
SUPABASE_URL=postgresql://usuario:contraseña@host:puerto/base_de_datos
```

---

### 2. Configuración de `src/config.js`

Este archivo define variables globales para el proyecto.  
**Se recomienda modificar:**

- `PORT`: Puerto en el que correrá la API.
- `SALT_ROUNDS`: Rondas de encriptación para contraseñas.
- `SECRET_JWT_KEY`: Clave secreta para JWT (cámbiala por una segura en producción).
- `EMAIL_USER` y `EMAIL_PASS`: Credenciales del correo para envío de notificaciones (Debe ser de un correo real "GMAIL", con verificación en 2 pasos y la contraseña debe ser de desarrollador).

Para solicitar la contraseña ("App Password de Google") se debe seguir la guía del siguiente link: `https://support.google.com/accounts/answer/185833?hl=en` 

```js
export const {
    PORT = 3000,
    SALT_ROUNDS = 10,
    SECRET_JWT_KEY = "cambia-esto-por-una-clave-segura",
    EMAIL_USER = "tu_correo@gmail.com",
    EMAIL_PASS = "tu_contraseña_de_app",
} = process.env;
```

---

### 3. Configuración de la Base de Datos (`src/database/database.js`)

El archivo soporta múltiples configuraciones (local, Supabase, etc.).  


- Para desarrollo local, configurar el nombre de la base, usuario, contraseña y host.
- Para producción/Supabase, utiliza las variables de entorno.

Ejemplo para MySQL local:

```js
export const sequelize = new Sequelize(
    'nombre_base',
    'usuario',
    'contraseña',
    {
        host: 'localhost',
        dialect: 'mysql',
        timezone: 'America/Guayaquil'
    }
);
```

---

### 4. Instalación de Dependencias

Ejecutar en la raíz del proyecto:

```sh
npm install
```

Principales dependencias:
- `express` (API)
- `sequelize` (ORM)
- `mysql2` o `pg` (driver de base de datos)
- `dotenv` (variables de entorno)
- `bcrypt` (hash de contraseñas)
- `jsonwebtoken` (autenticación)
- `nodemailer` (envío de correos)
- `multer` (subida de archivos)
- `moment-timezone`, `pdf-lib`, `exceljs`, etc.

---

### 5. Middleware de Autenticación

El archivo `src/middlewares/auth.js` implementa la autenticación JWT.  
**Asegurarse de que la clave `SECRET_JWT_KEY` esté correctamente configurada en `config.js` y/o `.env`.**

---

### 6. Uso de CORS

El middleware `src/middlewares/cors.js` permite solicitudes desde el frontend (por defecto: `http://localhost:5173`).  
Modificar el origen si el frontend está en otra URL.

---

### 7. Estructura de Rutas

Las rutas están organizadas por módulos en la carpeta `src/routes`:

- `auth_routes.js`: Autenticación y usuarios internos (Únicas Rutas Públicas).
- `user_routes.js`: Usuarios externos.
- `schedule_routes/`: Horarios, asistencias, resúmenes, etc.
- `parameter_routes/`: Parámetros administrativos (provincias, ciudades, etc.).

---

### 8. Modelos y Esquemas

Los modelos Sequelize están en `src/models` y los esquemas en `src/schemas`.  
**No olvidar sincronizar la base de datos antes de iniciar el servidor.**

---

### 9. Ejecución del Proyecto

Para iniciar el servidor:

```sh
npm run dev
```
o
```sh
node src/index.js
```

---

## 🛠️ Consideraciones Adicionales

- **Auditoría:** El sistema registra acciones importantes en la tabla `Audit`.
- **Carga de archivos:** Usa `multer` para documentos PDF (máx. 2MB) y en la foto de perfil usa Cloudinary (máx. 1MB).
- **Envío de correos:** Configurar correctamente `EMAIL_USER` y `EMAIL_PASS` para notificaciones.
- **Seguridad:** Cambiar todas las claves y contraseñas por valores seguros en producción.

---

## 📚 Documentación de Endpoints

La API expone endpoints RESTful para todas las entidades principales.  
Consultar la carpeta `src/routes` y los controladores en `src/controllers` para más detalles.

---

## 🧩 Ejemplo de Configuración Rápida

1. Clonar el repositorio.
2. Ajustar `src/config.js` y `src/database/database.js` según el entorno.
3. Instalar dependencias: `npm install`
4. Ejecutar: `npm run dev`
5. Acceder a la API en `http://localhost:3000` (o el puerto definido).

---

