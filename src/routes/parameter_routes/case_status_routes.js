import { Router } from "express";
import { CaseStatusController } from "../../controllers/parameter_controllers/CaseStatusController.js";

export const CaseStatusRouter = Router();

CaseStatusRouter.get('/case-status', CaseStatusController.getAll);
CaseStatusRouter.get('/case-status/:id', CaseStatusController.getById);
CaseStatusRouter.post('/case-status', CaseStatusController.create);
CaseStatusRouter.put('/case-status/:id', CaseStatusController.update);
CaseStatusRouter.delete('/case-status/:id', CaseStatusController.delete);
