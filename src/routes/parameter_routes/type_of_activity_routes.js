import { Router } from "express";
import { TypeOfActivityController } from "../../controllers/parameter_controllers/TypeOfActivityController.js";

export const TypeOfActivityRouter = Router();

TypeOfActivityRouter.get('/type-of-activity', TypeOfActivityController.getAll);
TypeOfActivityRouter.get('/type-of-activity/:id', TypeOfActivityController.getById);
TypeOfActivityRouter.post('/type-of-activity', TypeOfActivityController.create);
TypeOfActivityRouter.put('/type-of-activity/:id', TypeOfActivityController.update);
TypeOfActivityRouter.delete('/type-of-activity/:id', TypeOfActivityController.delete);
    