import { Router } from "express";
import { ScheduleController } from "../../controllers/parameter_controllers/ScheduleController.js";

export const ScheduleRouter = Router();

ScheduleRouter.get('/schedule', ScheduleController.getAll);
ScheduleRouter.get('/schedule/:id', ScheduleController.getById);
ScheduleRouter.post('/schedule', ScheduleController.create);
ScheduleRouter.put('/schedule/:id', ScheduleController.update);
ScheduleRouter.delete('/schedule/:id', ScheduleController.delete);