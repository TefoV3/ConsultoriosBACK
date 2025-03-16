import { CaseController } from "../controllers/CaseController.js";
import { Router } from "express";

export const CaseRouter = Router();

CaseRouter.get('/caso', CaseController.getCases);
CaseRouter.get('/caso/:id', CaseController.getById);
CaseRouter.post('/caso', CaseController.createCase);
CaseRouter.put('/caso/:id', CaseController.update);
CaseRouter.delete('/caso/:id', CaseController.delete);