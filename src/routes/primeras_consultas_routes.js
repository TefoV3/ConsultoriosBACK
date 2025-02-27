import { PrimerasConsultasController } from "../controllers/Primeras_consultasController.js";
import { Router } from "express";

export const PrimerasConsultasRouter = Router();

PrimerasConsultasRouter.get('/primerasconsultas', PrimerasConsultasController.getPrimerasConsultas);
PrimerasConsultasRouter.get('/primerasconsultas/:id', PrimerasConsultasController.getById);
PrimerasConsultasRouter.post('/primerasconsultas', PrimerasConsultasController.createPrimerasConsultas);
PrimerasConsultasRouter.put('/primerasconsultas/:id', PrimerasConsultasController.update);
PrimerasConsultasRouter.delete('/primerasconsultas/:id', PrimerasConsultasController.delete);