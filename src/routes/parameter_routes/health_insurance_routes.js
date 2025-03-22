import { Router } from "express";
import { HealthInsuranceController } from "../../controllers/parameter_controllers/HealthInsuranceController.js";

export const HealthInsuranceRouter = Router();

HealthInsuranceRouter.get('/segurodesalud', HealthInsuranceController.getAll);
HealthInsuranceRouter.get('/segurodesalud/:id', HealthInsuranceController.getById);
HealthInsuranceRouter.post('/segurodesalud', HealthInsuranceController.create);
HealthInsuranceRouter.put('/segurodesalud/:id', HealthInsuranceController.update);
HealthInsuranceRouter.delete('/segurodesalud/:id', HealthInsuranceController.delete);
