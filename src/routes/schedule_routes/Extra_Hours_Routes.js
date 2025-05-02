import { Extra_HoursController } from "../../controllers/schedule_controllers/Extra_HoursController.js";
import { Router } from "express";

export const ExtraHoursRouter = Router();

// 🔹 GET all
ExtraHoursRouter.get('/horasExtraordinarias', Extra_HoursController.getAll);

// 🔹 GET by ID
ExtraHoursRouter.get('/horasExtraordinarias/:id', Extra_HoursController.getById);

// 🔹 POST: creación normal
ExtraHoursRouter.post('/horasExtraordinarias', Extra_HoursController.create);

// 🔹 POST: con resumen (transacción)
ExtraHoursRouter.post('/horasExtraordinarias/createConResumen', Extra_HoursController.createWithSummary);

// 🔹 PUT: actualización
ExtraHoursRouter.put('/horasExtraordinarias/:id', Extra_HoursController.update);

// 🔹 DELETE: lógica
ExtraHoursRouter.delete('/horasExtraordinarias/:id', Extra_HoursController.delete);

// 🔹 GET por usuario
ExtraHoursRouter.get('/horasExtraordinariasByUser/:id', Extra_HoursController.getByUser);
