import { Router } from "express";
import { FamilyIncomeController } from "../../controllers/parameter_controllers/FamilyIncomeController.js";

export const FamilyIncomeRouter = Router();

FamilyIncomeRouter.get('/ingresofamiliar', FamilyIncomeController.getAll);
FamilyIncomeRouter.get('/ingresofamiliar/:id', FamilyIncomeController.getById);
FamilyIncomeRouter.post('/ingresofamiliar', FamilyIncomeController.create);
FamilyIncomeRouter.put('/ingresofamiliar/:id', FamilyIncomeController.update);
FamilyIncomeRouter.delete('/ingresofamiliar/:id', FamilyIncomeController.delete);
