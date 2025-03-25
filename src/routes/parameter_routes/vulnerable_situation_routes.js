import { Router } from "express";
import { VulnerableSituationController } from "../../controllers/parameter_controllers/VulnerableSituationController.js";

export const VulnerableSituationRouter = Router();

VulnerableSituationRouter.get('/vulnerable-situation', VulnerableSituationController.getAll);
VulnerableSituationRouter.get('/vulnerable-situation/:id', VulnerableSituationController.getById);
VulnerableSituationRouter.post('/vulnerable-situation', VulnerableSituationController.create);
VulnerableSituationRouter.put('/vulnerable-situation/:id', VulnerableSituationController.update);
VulnerableSituationRouter.delete('/vulnerable-situation/:id', VulnerableSituationController.delete);