import { Router } from "express";
import { ComplexityController } from "../../controllers/parameter_controllers/ComplexityController.js";

export const ComplexityRouter = Router();

ComplexityRouter.get("/complexities", ComplexityController.getAll);
ComplexityRouter.get("/complexities/:id", ComplexityController.getById);
ComplexityRouter.post("/complexities", ComplexityController.create);
ComplexityRouter.put("/complexities/:id", ComplexityController.update);
ComplexityRouter.delete("/complexities/:id", ComplexityController.delete);

