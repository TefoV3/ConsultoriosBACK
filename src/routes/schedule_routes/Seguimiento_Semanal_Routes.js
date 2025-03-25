import { Seguimiento_SemanalController } from "../../controllers/schedule_controllers/Seguimiento_Semanal_Controller.js";
import { Router } from "express";

export const Seguimiento_SemanalRouter = Router();

Seguimiento_SemanalRouter.get('/seguimientos', Seguimiento_SemanalController.getSeguimientos);
Seguimiento_SemanalRouter.get('/seguimientos/:id', Seguimiento_SemanalController.getById);
Seguimiento_SemanalRouter.post('/seguimientos', Seguimiento_SemanalController.create);
Seguimiento_SemanalRouter.put('/seguimientos/:id', Seguimiento_SemanalController.update);
Seguimiento_SemanalRouter.delete('/seguimientos/:id', Seguimiento_SemanalController.delete);

