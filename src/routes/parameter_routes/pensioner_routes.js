import { Router } from "express";
import { PensionerController } from "../../controllers/parameter_controllers/PensionerController.js";

export const PensionerRouter = Router();

PensionerRouter.get('/pensionista', PensionerController.getAll);
PensionerRouter.get('/pensionista/:id', PensionerController.getById);
PensionerRouter.post('/pensionista', PensionerController.create);
PensionerRouter.put('/pensionista/:id', PensionerController.update);
PensionerRouter.delete('/pensionista/:id', PensionerController.delete);
