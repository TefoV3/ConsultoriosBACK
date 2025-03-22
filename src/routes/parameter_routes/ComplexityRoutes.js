import express from "express";
import { ComplexityController } from "../../controllers/parameter_tables/ComplexityController.js";

const ComplexityRouter = express.Router();

ComplexityRouter.get("/complexities", ComplexityController.getAll);
ComplexityRouter.get("/complexities/:id", ComplexityController.getById);
ComplexityRouter.post("/complexities", ComplexityController.create);
ComplexityRouter.put("/complexities/:id", ComplexityController.update);
ComplexityRouter.delete("/complexities/:id", ComplexityController.delete);

