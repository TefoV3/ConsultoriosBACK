import { EvidenceController } from "../controllers/EvidencesController.js";
import { Router } from "express";
import {upload } from "../middlewares/uploadMiddleware.js";
import { authMiddleware} from "../middlewares/auth.js";

export const EvidenceRouter = Router();

EvidenceRouter.get('/evidence', EvidenceController.getEvidences);
EvidenceRouter.get("/evidence/:id", EvidenceController.downloadEvidence);
EvidenceRouter.get('/evidence/id/:id', EvidenceController.getById); 
EvidenceRouter.put('/evidence/:id', EvidenceController.update);
EvidenceRouter.delete('/evidence/:id', EvidenceController.delete);

//DOCUMENT MANAGMENT
EvidenceRouter.get("/evidence/consultation/:code", EvidenceController.getByConsultationsCode); //Obtiene la evidencia por el código de consulta, para cargar en el dialog
EvidenceRouter.get("/evidence/document/:id", EvidenceController.getDocumentById);
// (Esto en caso de que se cree una nueva consulta)
EvidenceRouter.post("/evidence", upload.single("evidenceFile"), EvidenceController.uploadEvidence); //Crea una nueva evidencia de cero, ya sea con documento o sin documento 
EvidenceRouter.put("/evidence/new/document/:id", upload.single("evidenceFile"), EvidenceController.uploadNewDocument); //Crea un nuevo documento para una evidencia existente
EvidenceRouter.delete("/evidence/document/:id", EvidenceController.deleteDocument); //Elimina un documento de una evidencia existente
