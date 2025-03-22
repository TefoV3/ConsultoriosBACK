import express from "express";
import { PeriodTypeController } from "../../controllers/parameter_controllers/PeriodTypeController.js";

const PeriodTypeRouter = express.Router();

PeriodTypeRouter.get("/period-types", PeriodTypeController.getAll);
PeriodTypeRouter.get("/period-types/:id", PeriodTypeController.getById);
PeriodTypeRouter.post("/period-types", PeriodTypeController.create);
PeriodTypeRouter.put("/period-types/:id", PeriodTypeController.update);
PeriodTypeRouter.delete("/period-types/:id", PeriodTypeController.delete);

