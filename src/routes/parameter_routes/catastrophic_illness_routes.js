import { Router } from "express";
import { CatastrophicIllnessController } from "../../controllers/parameter_controllers/CatastrophicIllnessController.js";

export const CatastrophicIllnessRouter = Router();

CatastrophicIllnessRouter.get('/enfermedad', CatastrophicIllnessController.getAll);
CatastrophicIllnessRouter.get('/enfermedad/:id', CatastrophicIllnessController.getById);
CatastrophicIllnessRouter.post('/enfermedad', CatastrophicIllnessController.create);
CatastrophicIllnessRouter.put('/enfermedad/:id', CatastrophicIllnessController.update);
CatastrophicIllnessRouter.delete('/enfermedad/:id', CatastrophicIllnessController.delete);
    