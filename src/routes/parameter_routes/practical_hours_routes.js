import { Router } from "express";
import { PracticalHoursController } from "../../controllers/parameter_controllers/PracticalHoursController.js";

export const PracticalHoursRouter = Router();

PracticalHoursRouter.get("/practical-hours", PracticalHoursController.getAll);
PracticalHoursRouter.get("/practical-hours/:id", PracticalHoursController.getById);
PracticalHoursRouter.post("/practical-hours", PracticalHoursController.create);
PracticalHoursRouter.put("/practical-hours/:id", PracticalHoursController.update);
PracticalHoursRouter.delete("/practical-hours/:id", PracticalHoursController.delete);

