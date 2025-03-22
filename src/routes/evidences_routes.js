import { EvidenceController } from "../controllers/EvidencesController.js";
import { Router } from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import { authMiddleware} from "../middlewares/auth.js";

export const EvidenceRouter = Router();

EvidenceRouter.get('/evidencia', EvidenceController.getEvidences);
//EvidenceRouter.get('/evidencia/:id', EvidenceController.getById);
EvidenceRouter.get("/evidencia/:id", EvidenceController.downloadEvidence);
//EvidenceRouter.post('/evidencia', EvidenceController.createEvidence);
EvidenceRouter.post("/evidencia", upload.single("file"), EvidenceController.uploadEvidence);
EvidenceRouter.put('/evidencia/:id', EvidenceController.update);
EvidenceRouter.delete('/evidencia/:id', EvidenceController.delete);