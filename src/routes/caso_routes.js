import { CasoController } from "../controllers/CasoController.js";
import { Router } from "express";

export const CasoRouter = Router();

CasoRouter.get('/caso', CasoController.getCasos);
CasoRouter.get('/caso/:id', CasoController.getById);
CasoRouter.post('/caso', CasoController.createCaso);
CasoRouter.put('/caso/:id', CasoController.update);
CasoRouter.delete('/caso/:id', CasoController.delete);