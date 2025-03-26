import { Router } from "express";
import { HealthInsuranceController } from "../../controllers/parameter_controllers/HealthInsuranceController.js";

export const HealthInsuranceRouter = Router();

HealthInsuranceRouter.get('/health-insurance', HealthInsuranceController.getAll);
HealthInsuranceRouter.get('/health-insurance/:id', HealthInsuranceController.getById);
HealthInsuranceRouter.post('/health-insurance', HealthInsuranceController.create);
HealthInsuranceRouter.put('/health-insurance/:id', HealthInsuranceController.update);
HealthInsuranceRouter.delete('/health-insurance/:id', HealthInsuranceController.delete);
