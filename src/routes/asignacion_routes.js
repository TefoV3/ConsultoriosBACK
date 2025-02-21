import { AsignacionController } from "../controllers/AsignacionController.js";
import { Router } from "express";

export const AsignacionRouter = Router();

AsignacionRouter.get('/asignacion', AsignacionController.getAsignaciones);
AsignacionRouter.get('/asignacion/:id', AsignacionController.getById);
AsignacionRouter.post('/asignacion', AsignacionController.createAsignacion);
AsignacionRouter.put('/asignacion/:id', AsignacionController.update);
AsignacionRouter.delete('/asignacion/:id', AsignacionController.delete);