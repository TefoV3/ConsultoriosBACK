import { EvidenciaController } from "../controllers/EvidenciasController.js";
import { Router } from "express";

export const EvidenciaRouter = Router();

EvidenciaRouter.get('/evidencia', EvidenciaController.getEvidencias);
EvidenciaRouter.get('/evidencia/:id', EvidenciaController.getById);
EvidenciaRouter.post('/evidencia', EvidenciaController.createEvidencia);
EvidenciaRouter.put('/evidencia/:id', EvidenciaController.update);
EvidenciaRouter.delete('/evidencia/:id', EvidenciaController.delete);