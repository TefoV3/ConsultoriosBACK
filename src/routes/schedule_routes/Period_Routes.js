import { PeriodController } from "../../controllers/schedule_controllers/PeriodController.js";
import { Router } from "express";

export const PeriodRouter = Router();

PeriodRouter.get('/periodos', PeriodController.getPeriods);
PeriodRouter.get('/periodos/:id/seguimientos', PeriodController.getPeriodWithTracking); // Specific route
PeriodRouter.get('/periodos/:id', PeriodController.getById);
PeriodRouter.post('/periodos', PeriodController.createPeriod);
PeriodRouter.put('/periodos/:id', PeriodController.update);
PeriodRouter.delete('/periodos/:id', PeriodController.delete);
