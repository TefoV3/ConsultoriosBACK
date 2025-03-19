import { Router } from "express";
import { ParametersController } from "../controllers/ParametersController.js";

export const ParametersRouter = Router();

router.get("/parameters/zone/:zone", ParametersController.getByZone);
router.post("/parameters", ParametersController.create);
router.put("/parameters/:zone/:sector", ParametersController.update);
router.delete("/parameters/:zone/:sector", ParametersController.delete);

