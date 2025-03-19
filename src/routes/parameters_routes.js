import { Router } from "express";
import { ParametersController } from "../controllers/ParametersController.js";

export const ParametersRouter = Router();

ParametersRouter.get("/parameters/zone/:zone", ParametersController.getByZone);
ParametersRouter.post("/parameters", ParametersController.create);
ParametersRouter.put("/parameters/:zone/:sector", ParametersController.update);
ParametersRouter.delete("/parameters/:zone/:sector", ParametersController.delete);

