import { Router } from "express";
import { TypeOfHousingController } from "../../controllers/parameter_controllers/TypeOfHousingController.js";

export const TypeOfHousingRouter = Router();

TypeOfHousingRouter.get('/tipodevivienda', TypeOfHousingController.getAll);
TypeOfHousingRouter.get('/tipodevivienda/:id', TypeOfHousingController.getById);
TypeOfHousingRouter.post('/tipodevivienda', TypeOfHousingController.create);
TypeOfHousingRouter.put('/tipodevivienda/:id', TypeOfHousingController.update);
TypeOfHousingRouter.delete('/tipodevivienda/:id', TypeOfHousingController.delete);
