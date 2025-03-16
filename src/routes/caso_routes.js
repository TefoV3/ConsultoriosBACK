import { CaseController } from "../controllers/CasoController.js";
import { Router } from "express";

export const CasoRouter = Router();

CasoRouter.get('/caso', CaseController.getCases);
CasoRouter.get('/caso/:id', CaseController.getById);
CasoRouter.post('/caso', CaseController.createCase);
CasoRouter.put('/caso/:id', CaseController.update);
CasoRouter.delete('/caso/:id', CaseController.delete);