import { Seguimiento_SemanalController } from "../../controllers/schedule_controllers/Seguimiento_Semanal_Controller.js";
import { Router } from "express";

export const Seguimiento_SemanalRouter = Router();

// GET endpoints (más específicos primero)
Seguimiento_SemanalRouter.get('/seguimientos/last/:periodoId', Seguimiento_SemanalController.getLastSeguimientoByPeriodo);
Seguimiento_SemanalRouter.get('/seguimientos', Seguimiento_SemanalController.getSeguimientos);
Seguimiento_SemanalRouter.get('/seguimientos/:id', Seguimiento_SemanalController.getById);

// POST endpoints
Seguimiento_SemanalRouter.post('/seguimientos', Seguimiento_SemanalController.create);
Seguimiento_SemanalRouter.post('/seguimientos/bulk', Seguimiento_SemanalController.createBulk);

// PUT endpoints
// Nuevo endpoint para recalcular (reordenar) las semanas
Seguimiento_SemanalRouter.put('/seguimientos/reorder/:periodoId', Seguimiento_SemanalController.recalcularSemanas);
Seguimiento_SemanalRouter.put('/seguimientos/:id', Seguimiento_SemanalController.update);

// DELETE endpoint
Seguimiento_SemanalRouter.delete('/seguimientos/:id', Seguimiento_SemanalController.delete);
