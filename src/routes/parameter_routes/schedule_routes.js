import { Router } from "express";

import { ScheduleController } from "../../controllers/parameter_controllers/ScheduleController.js";

export const ScheduleRouter = Router();

ScheduleRouter.get('/horario', ScheduleController.getAll);
ScheduleRouter.get('/horario/:id', ScheduleController.getById);
ScheduleRouter.post('/horario', ScheduleController.create);
ScheduleRouter.put('/horario/:id', ScheduleController.update);
ScheduleRouter.delete('/horario/:id', ScheduleController.delete);