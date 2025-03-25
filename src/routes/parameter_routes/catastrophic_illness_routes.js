import { Router } from "express";
import { CatastrophicIllnessController } from "../../controllers/parameter_controllers/CatastrophicIllnessController.js";

export const CatastrophicIllnessRouter = Router();

CatastrophicIllnessRouter.get('/illness', CatastrophicIllnessController.getAll);
CatastrophicIllnessRouter.get('/illness/:id', CatastrophicIllnessController.getById);
CatastrophicIllnessRouter.post('/illness', CatastrophicIllnessController.create);
CatastrophicIllnessRouter.put('/illness/:id', CatastrophicIllnessController.update);
CatastrophicIllnessRouter.delete('/illness/:id', CatastrophicIllnessController.delete);
    