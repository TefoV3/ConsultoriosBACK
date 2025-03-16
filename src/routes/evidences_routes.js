import { EvidenceController } from "../controllers/EvidencesController.js";
import { Router } from "express";

export const EvidenceRouter = Router();

EvidenceRouter.get('/evidencia', EvidenceController.getEvidences);
EvidenceRouter.get('/evidencia/:id', EvidenceController.getById);
EvidenceRouter.post('/evidencia', EvidenceController.createEvidence);
EvidenceRouter.put('/evidencia/:id', EvidenceController.update);
EvidenceRouter.delete('/evidencia/:id', EvidenceController.delete);