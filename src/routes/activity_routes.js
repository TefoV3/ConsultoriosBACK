import { ActivityController } from "../controllers/ActivityController.js";
import { Router } from "express";
import { upload } from "../middlewares/uploadMiddleware.js";

export const ActivityRouter = Router();

ActivityRouter.get('/actividad', ActivityController.getActivities);
ActivityRouter.get('/actividad/caso/:codeCase', ActivityController.getAllByCodeCase);
ActivityRouter.get('/actividad/:id', ActivityController.getById);
ActivityRouter.post('/actividad', upload.single("file"), ActivityController.createActivity);
ActivityRouter.put('/actividad/:id', ActivityController.update);
ActivityRouter.delete('/actividad/:id', ActivityController.delete);
