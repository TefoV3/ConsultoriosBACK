import { Router } from "express";
import { OccupationsController } from "../../controllers/parameter_controllers/OccupationsController.js";

export const OccupationsRouter = Router();

OccupationsRouter.get('/occupations', OccupationsController.getAll);
OccupationsRouter.get('/occupations/:id', OccupationsController.getById);
OccupationsRouter.post('/occupations', OccupationsController.create);
OccupationsRouter.put('/occupations/:id', OccupationsController.update);
OccupationsRouter.delete('/occupations/:id', OccupationsController.delete);
