import multer from 'multer';
import path from 'path';

// Configuración básica para almacenar en memoria (Cloudinary lo tomará desde ahí)
// Puedes configurar almacenamiento en disco si prefieres procesar antes de subir
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('¡Solo se permiten archivos de imagen!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // Límite de 1MB
});

export default upload;