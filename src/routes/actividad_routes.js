import { ActivityController } from "../controllers/ActividadController.js";
import { Router } from "express";

export const ActividadRouter = Router();

ActividadRouter.get('/actividad', ActivityController.getActivities);
ActividadRouter.get('/actividad/:id', ActivityController.getById);
ActividadRouter.post('/actividad', ActivityController.createActivity);
ActividadRouter.put('/actividad/:id', ActivityController.update);
ActividadRouter.delete('/actividad/:id', ActivityController.delete);
