import { Router } from "express";
import { FamilyIncomeController } from "../../controllers/parameter_controllers/FamilyIncomeController.js";

export const FamilyIncomeRouter = Router();

FamilyIncomeRouter.get('/family-income', FamilyIncomeController.getAll);
FamilyIncomeRouter.get('/family-income/:id', FamilyIncomeController.getById);
FamilyIncomeRouter.post('/family-income', FamilyIncomeController.create);
FamilyIncomeRouter.put('/family-income/:id', FamilyIncomeController.update);
FamilyIncomeRouter.delete('/family-income/:id', FamilyIncomeController.delete);
