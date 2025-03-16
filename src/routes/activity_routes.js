import { ActivityController } from "../controllers/ActivityController.js";
import { Router } from "express";

export const ActivityRouter = Router();

ActivityRouter.get('/actividad', ActivityController.getActivities);
ActivityRouter.get('/actividad/:id', ActivityController.getById);
ActivityRouter.post('/actividad', ActivityController.createActivity);
ActivityRouter.put('/actividad/:id', ActivityController.update);
ActivityRouter.delete('/actividad/:id', ActivityController.delete);
