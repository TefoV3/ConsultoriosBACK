import express from "express";
import { PracticalHoursController } from "../../controllers/parameter_tables/PracticalHoursController.js";

const PracticalHoursRouter = express.Router();

PracticalHoursRouter.get("/practical-hours", PracticalHoursController.getAll);
PracticalHoursRouter.get("/practical-hours/:id", PracticalHoursController.getById);
PracticalHoursRouter.post("/practical-hours", PracticalHoursController.create);
PracticalHoursRouter.put("/practical-hours/:id", PracticalHoursController.update);
PracticalHoursRouter.delete("/practical-hours/:id", PracticalHoursController.delete);

