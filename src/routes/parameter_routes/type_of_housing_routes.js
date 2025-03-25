import { Router } from "express";
import { TypeOfHousingController } from "../../controllers/parameter_controllers/TypeOfHousingController.js";

export const TypeOfHousingRouter = Router();

TypeOfHousingRouter.get('/type-of-housing', TypeOfHousingController.getAll);
TypeOfHousingRouter.get('/type-of-housing/:id', TypeOfHousingController.getById);
TypeOfHousingRouter.post('/type-of-housing', TypeOfHousingController.create);
TypeOfHousingRouter.put('/type-of-housing/:id', TypeOfHousingController.update);
TypeOfHousingRouter.delete('/type-of-housing/:id', TypeOfHousingController.delete);
