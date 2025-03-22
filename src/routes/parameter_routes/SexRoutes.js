import { Router } from "express";
import { SexController } from "../../controllers/parameter_controllers/SexController.js";

export const SexRouter = Router();

SexRouter.get("/sexes", SexController.getAll);
SexRouter.get("/sexes/:id", SexController.getById);
SexRouter.post("/sexes", SexController.create);
SexRouter.put("/sexes/:id", SexController.update);
SexRouter.delete("/sexes/:id", SexController.delete);

