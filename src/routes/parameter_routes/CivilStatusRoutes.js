import express from "express";
import { CivilStatusController } from "../../controllers/parameter_controllers/CivilStatusController.js";

const CivilStatusRouter = express.Router();

CivilStatusRouter.get("/civil-statuses", CivilStatusController.getAll);
CivilStatusRouter.get("/civil-statuses/:id", CivilStatusController.getById);
CivilStatusRouter.post("/civil-statuses", CivilStatusController.create);
CivilStatusRouter.put("/civil-statuses/:id", CivilStatusController.update);
CivilStatusRouter.delete("/civil-statuses/:id", CivilStatusController.delete);

