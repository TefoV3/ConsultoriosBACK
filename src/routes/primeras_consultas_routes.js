import { FirstConsultationsController } from "../controllers/Primeras_consultasController.js";
import { Router } from "express";

export const PrimerasConsultasRouter = Router();

PrimerasConsultasRouter.get('/primerasconsultas', FirstConsultationsController.getFirstConsultations);
PrimerasConsultasRouter.get('/primerasconsultas/:id', FirstConsultationsController.getById);
PrimerasConsultasRouter.post('/primerasconsultas', FirstConsultationsController.createFirstConsultations);
PrimerasConsultasRouter.put('/primerasconsultas/:id', FirstConsultationsController.update);
PrimerasConsultasRouter.delete('/primerasconsultas/:id', FirstConsultationsController.delete);