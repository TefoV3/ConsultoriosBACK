import { EvidenceController } from "../controllers/EvidencesController.js";
import { Router } from "express";
import {upload } from "../middlewares/uploadMiddleware.js";
import { authMiddleware} from "../middlewares/auth.js";

export const EvidenceRouter = Router();

EvidenceRouter.get('/evidence', EvidenceController.getEvidences);
//EvidenceRouter.get('/evidence/:id', EvidenceController.getById);
EvidenceRouter.get("/evidence/:id", EvidenceController.downloadEvidence);
//EvidenceRouter.post('/evidence', EvidenceController.createEvidence);
EvidenceRouter.post("/evidence", upload.single("file"), EvidenceController.uploadEvidence);
EvidenceRouter.put('/evidence/:id', EvidenceController.update);
EvidenceRouter.delete('/evidence/:id', EvidenceController.delete);