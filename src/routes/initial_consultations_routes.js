import { FirstConsultationsController } from "../controllers/InitialConsultationsController.js";
import { Router } from "express";

export const InitialConsultationsRouter = Router();

InitialConsultationsRouter.get('/primerasconsultas', FirstConsultationsController.getFirstConsultations);
InitialConsultationsRouter.get('/primerasconsultas/:id', FirstConsultationsController.getById);
InitialConsultationsRouter.post('/primerasconsultas', FirstConsultationsController.createFirstConsultations);
InitialConsultationsRouter.put('/primerasconsultas/:id', FirstConsultationsController.update);
InitialConsultationsRouter.delete('/primerasconsultas/:id', FirstConsultationsController.delete);