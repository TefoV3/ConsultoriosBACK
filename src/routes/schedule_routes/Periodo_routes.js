import { PeriodoController } from "../../controllers/schedule_controllers/PeriodoController.js";
import { Router } from "express";

export const PeriodoRouter = Router();

PeriodoRouter.get('/periodos', PeriodoController.getPeriodos);
PeriodoRouter.get('/periodos/:id/seguimientos', PeriodoController.getPeriodoConSeguimientos); // Ruta nueva específica
PeriodoRouter.get('/periodos/:id', PeriodoController.getById);
PeriodoRouter.post('/periodos', PeriodoController.createPeriodo);
PeriodoRouter.put('/periodos/:id', PeriodoController.update);
PeriodoRouter.delete('/periodos/:id', PeriodoController.delete);
