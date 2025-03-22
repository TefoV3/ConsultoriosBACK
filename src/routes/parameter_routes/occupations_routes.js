import { Router } from "express";
import { OccupationsController } from "../../controllers/parameter_controllers/OccupationsController.js";

export const OccupationsRouter = Router();

OccupationsRouter.get('/ocupaciones', OccupationsController.getAll);
OccupationsRouter.get('/ocupaciones/:id', OccupationsController.getById);
OccupationsRouter.post('/ocupaciones', OccupationsController.create);
OccupationsRouter.put('/ocupaciones/:id', OccupationsController.update);
OccupationsRouter.delete('/ocupaciones/:id', OccupationsController.delete);
