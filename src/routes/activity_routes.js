import { ActivityController } from "../controllers/ActivityController.js";
import { Router } from "express";
import { upload } from "../middlewares/uploadMiddleware.js";

export const ActivityRouter = Router();

ActivityRouter.get('/activity', ActivityController.getActivities);
ActivityRouter.get('/activity/case/:codeCase', ActivityController.getAllByCodeCase);
ActivityRouter.get('/activity/:id', ActivityController.getById);
ActivityRouter.get('/activity/document/:id', ActivityController.getDocumentById); 
ActivityRouter.post('/activity', upload.single("file"), ActivityController.createActivity);
ActivityRouter.put('/activity/:id', ActivityController.update);
ActivityRouter.delete('/activity/:id', ActivityController.delete);
