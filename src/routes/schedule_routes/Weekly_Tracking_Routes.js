// routes/schedule_routes/Weekly_TrackingRouter.js
import { Weekly_TrackingController } from "../../controllers/schedule_controllers/Weekly_TrackingController.js";
import { Router } from "express";

export const Weekly_TrackingRouter = Router();

// GET endpoints 
Weekly_TrackingRouter.get('/seguimientos/last/:periodId', Weekly_TrackingController.getLastByPeriod);
Weekly_TrackingRouter.get('/seguimientos', Weekly_TrackingController.getAll);
Weekly_TrackingRouter.get('/seguimientos/:id', Weekly_TrackingController.getById);

// POST endpoints
Weekly_TrackingRouter.post('/seguimientos', Weekly_TrackingController.create);
Weekly_TrackingRouter.post('/seguimientos/bulk', Weekly_TrackingController.createBulk);

// PUT endpoints
// Endpoint to reorder weeks
Weekly_TrackingRouter.put('/seguimientos/reorder/:periodId', Weekly_TrackingController.recalculateWeeks);
Weekly_TrackingRouter.put('/seguimientos/:id', Weekly_TrackingController.update);

// DELETE endpoint
Weekly_TrackingRouter.delete('/seguimientos/:id', Weekly_TrackingController.delete);
