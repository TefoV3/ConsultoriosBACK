import { Router } from "express";
import { FamilyGroupController } from "../../controllers/parameter_controllers/FamilyGroupController.js";

export const FamilyGroupRouter = Router();

FamilyGroupRouter.get('/family-group', FamilyGroupController.getAll);
FamilyGroupRouter.get('/family-group/:id', FamilyGroupController.getById);
FamilyGroupRouter.post('/family-group', FamilyGroupController.create);
FamilyGroupRouter.put('/family-group/:id', FamilyGroupController.update);
FamilyGroupRouter.delete('/family-group/:id', FamilyGroupController.delete);
