import multer from "multer";

// Configurar almacenamiento en memoria
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limitar el tamaño del archivo a 2 MB
    fileFilter: (req, file, cb) => {
        if (file && file.mimetype !== "application/pdf") {
            return cb(new Error("Solo se permiten archivos PDF"), false); // Rechazar archivos que no sean PDF
        }
        cb(null, true); // ✅ Archivo aceptado
    }
});



