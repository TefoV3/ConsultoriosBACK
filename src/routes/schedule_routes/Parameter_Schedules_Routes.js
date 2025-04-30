import { Parameter_ScheduleController } from "../../controllers/schedule_controllers/Parameter_ScheduleController.js";
import { Router } from "express";

export const Parameter_ScheduleRouter = Router();

// 🔹 Obtener todos los registros
Parameter_ScheduleRouter.get('/parametroHorario', Parameter_ScheduleController.getAll);

// 🔹 Obtener un registro por clave primaria
Parameter_ScheduleRouter.get('/parametroHorario/:parameterScheduleId', Parameter_ScheduleController.getById);

// 🔹 Obtener horarios disponibles por tipo
Parameter_ScheduleRouter.get('/parametroHorario/disponibilidad/:type/:periodId/:area/:day', Parameter_ScheduleController.getAvailableByType);

// 🔹 Crear un nuevo registro
Parameter_ScheduleRouter.post('/parametroHorario', Parameter_ScheduleController.create);

// 🔹 Actualizar un registro por clave primaria
Parameter_ScheduleRouter.put('/parametroHorario/:parameterScheduleId', Parameter_ScheduleController.update);

// 🔹 Eliminar un registro por clave primaria
Parameter_ScheduleRouter.delete('/parametroHorario/:parameterScheduleId', Parameter_ScheduleController.delete);
