import { Router } from "express";
import { VulnerableSituationController } from "../../controllers/parameter_controllers/VulnerableSituationController.js";

export const VulnerableSituationRouter = Router();

VulnerableSituationRouter.get('/situacion_vulnerable', VulnerableSituationController.getAll);
VulnerableSituationRouter.get('/situacion_vulnerable/:id', VulnerableSituationController.getById);
VulnerableSituationRouter.post('/situacion_vulnerable', VulnerableSituationController.create);
VulnerableSituationRouter.put('/situacion_vulnerable/:id', VulnerableSituationController.update);
VulnerableSituationRouter.delete('/situacion_vulnerable/:id', VulnerableSituationController.delete);