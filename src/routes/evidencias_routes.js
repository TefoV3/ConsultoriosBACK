import { EvidenceController } from "../controllers/EvidenciasController.js";
import { Router } from "express";

export const EvidenciaRouter = Router();

EvidenciaRouter.get('/evidencia', EvidenceController.getEvidences);
EvidenciaRouter.get('/evidencia/:id', EvidenceController.getById);
EvidenciaRouter.post('/evidencia', EvidenceController.createEvidence);
EvidenciaRouter.put('/evidencia/:id', EvidenceController.update);
EvidenciaRouter.delete('/evidencia/:id', EvidenceController.delete);