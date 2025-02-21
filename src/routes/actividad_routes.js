import { ActividadController } from "../controllers/ActividadController.js";
import { Router } from "express";

export const ActividadRouter = Router();

ActividadRouter.get('/actividad', ActividadController.getActividades);
ActividadRouter.get('/actividad/:id', ActividadController.getById);
ActividadRouter.post('/actividad', ActividadController.createActividad);
ActividadRouter.put('/actividad/:id', ActividadController.update);
ActividadRouter.delete('/actividad/:id', ActividadController.delete);