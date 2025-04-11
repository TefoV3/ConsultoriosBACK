import { Parametro_HorarioController } from "../../controllers/schedule_controllers/Parametro_Horario_Controller.js";

import { Router } from "express";

export const Parametro_HorarioRouter = Router();

// 🔹 Obtener todos los registros
Parametro_HorarioRouter.get('/parametroHorario', Parametro_HorarioController.getParametro_Horarios);

// 🔹 Obtener un registro por clave primaria
Parametro_HorarioRouter.get('/parametroHorario/:parametroHorarioId', Parametro_HorarioController.getById);

// 🔹 Obtener horarios disponibles por tipo
Parametro_HorarioRouter.get('/parametroHorario/disponibilidad/:tipo/:periodoId/:area/:dia', Parametro_HorarioController.getHorariosDisponiblesPorTipo);

// 🔹 Crear un nuevo registro
Parametro_HorarioRouter.post('/parametroHorario', Parametro_HorarioController.create);

// 🔹 Actualizar un registro por clave primaria
Parametro_HorarioRouter.put('/parametroHorario/:parametroHorarioId', Parametro_HorarioController.update);

// 🔹 Eliminar un registro por clave primaria
Parametro_HorarioRouter.delete('/parametroHorario/:parametroHorarioId', Parametro_HorarioController.delete);