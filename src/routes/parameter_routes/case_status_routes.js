import { Router } from "express";
import { CaseStatusController } from "../../controllers/parameter_controllers/CaseStatusController.js";

export const CaseStatusRouter = Router();

CaseStatusRouter.get('/case_status', CaseStatusController.getAll);
CaseStatusRouter.get('/case_status/:id', CaseStatusController.getById);
CaseStatusRouter.post('/case_status', CaseStatusController.create);
CaseStatusRouter.put('/case_status/:id', CaseStatusController.update);
CaseStatusRouter.delete('/case_status/:id', CaseStatusController.delete);
