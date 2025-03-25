import { Router } from "express";
import { PensionerController } from "../../controllers/parameter_controllers/PensionerController.js";

export const PensionerRouter = Router();

PensionerRouter.get('/pensioner', PensionerController.getAll);
PensionerRouter.get('/pensioner/:id', PensionerController.getById);
PensionerRouter.post('/pensioner', PensionerController.create);
PensionerRouter.put('/pensioner/:id', PensionerController.update);
PensionerRouter.delete('/pensioner/:id', PensionerController.delete);
