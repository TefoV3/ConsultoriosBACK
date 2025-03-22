import { Router } from "express";
import { FamilyGroupController } from "../../controllers/parameter_controllers/FamilyGroupController.js";

export const FamilyGroupRouter = Router();

FamilyGroupRouter.get('/grupofamiliar', FamilyGroupController.getAll);
FamilyGroupRouter.get('/grupofamiliar/:id', FamilyGroupController.getById);
FamilyGroupRouter.post('/grupofamiliar', FamilyGroupController.create);
FamilyGroupRouter.put('/grupofamiliar/:id', FamilyGroupController.update);
FamilyGroupRouter.delete('/grupofamiliar/:id', FamilyGroupController.delete);
