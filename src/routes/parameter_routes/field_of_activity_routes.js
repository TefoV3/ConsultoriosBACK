import { Router } from "express";
import { FieldOfActivityController } from "../../controllers/parameter_controllers/FieldOfActivityController.js";

export const FieldOfActivityRouter = Router();

FieldOfActivityRouter.get('/field-of-activity', FieldOfActivityController.getAll);
FieldOfActivityRouter.get('/field-of-activity/:id', FieldOfActivityController.getById);
FieldOfActivityRouter.get('/field-of-activity/type/:typeOfActivityId/status', FieldOfActivityController.getByTypeOfActivityIdAndStatus);
FieldOfActivityRouter.post('/field-of-activity', FieldOfActivityController.create);
FieldOfActivityRouter.put('/field-of-activity/:id', FieldOfActivityController.update);
FieldOfActivityRouter.delete('/field-of-activity/:id', FieldOfActivityController.delete);
    