import multer from "multer";

// Configurar almacenamiento en memoria
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    ffileFilter: (req, file, cb) => {
        if (!file) { 
            return cb(new Error("Archivo no definido"), false);
        }
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Solo se permiten archivos PDF"), false);
        }
        cb(null, true);
    }
    
});



