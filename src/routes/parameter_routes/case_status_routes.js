import { Router } from "express";
import { CaseStatusController } from "../../controllers/parameter_controllers/CaseStatusController.js";

export const CaseStatusRouter = Router();

CaseStatusRouter.get('/estado_caso', CaseStatusController.getAll);
CaseStatusRouter.get('/cestado_caso/:id', CaseStatusController.getById);
CaseStatusRouter.post('/estado_caso', CaseStatusController.create);
CaseStatusRouter.put('/estado_caso/:id', CaseStatusController.update);
CaseStatusRouter.delete('/estado_caso/:id', CaseStatusController.delete);