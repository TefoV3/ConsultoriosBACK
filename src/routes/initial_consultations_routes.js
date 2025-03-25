import { FirstConsultationsController } from "../controllers/InitialConsultationsController.js";
import { Router } from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import { authMiddleware } from "../middlewares/auth.js";


export const InitialConsultationsRouter = Router();

InitialConsultationsRouter.get('/initial-consultations', FirstConsultationsController.getFirstConsultations);
InitialConsultationsRouter.get('/initial-consultations/:id', FirstConsultationsController.getById);
InitialConsultationsRouter.get('/initial-consultations/user/:userId', FirstConsultationsController.getByUserId);
InitialConsultationsRouter.get('/initial-consultations/status/:status', FirstConsultationsController.getByStatus);
InitialConsultationsRouter.get('/initial-consultations/1/:internalId', FirstConsultationsController.getAllActiveCasesByInternalID);
InitialConsultationsRouter.get('/initial-consultations/0/:internalId', FirstConsultationsController.getAllInactiveCasesByInternalID);

//InitialConsultationsRouter.post('/initial-consultations', FirstConsultationsController.createFirstConsultations);
InitialConsultationsRouter.post(
    "/initial-consultations",
    upload.fields([
        { name: "evidenceFile", maxCount: 1 },
        { name: "healthDocuments", maxCount: 1 }
    ]),
    FirstConsultationsController.createFirstConsultations
);
InitialConsultationsRouter.put('/initial-consultations/:id', FirstConsultationsController.update);
InitialConsultationsRouter.delete('/initial-consultations/:id', FirstConsultationsController.delete);

