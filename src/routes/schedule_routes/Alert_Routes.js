import { AlertController } from "../../controllers/schedule_controllers/AlertController.js";
import { Router } from "express";

export const AlertRouter = Router();

// ✅ Obtener alertas por ID de usuario (antes que '/alerta/:id')
AlertRouter.get('/alerta/usuario/:userId', AlertController.getByUserId);

// Obtener todas las alertas activas
AlertRouter.get('/alerta', AlertController.getAll);

// Obtener una alerta por ID
AlertRouter.get('/alerta/:id', AlertController.getById);

// Crear una nueva alerta
AlertRouter.post('/alerta', AlertController.create);

// Actualizar una alerta existente
AlertRouter.put('/alerta/:id', AlertController.update);

// Eliminar lógicamente una alerta
AlertRouter.delete('/alerta/:id', AlertController.delete);
