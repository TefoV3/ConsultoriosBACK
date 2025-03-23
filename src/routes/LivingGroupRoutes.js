import { Router } from "express";
import { LivingGroupController } from "../controllers/LivingGroupController.js";

export const LivingGroupRouter = Router();

LivingGroupRouter.get("/living-groups", LivingGroupController.getAll);
LivingGroupRouter.get("/living-groups/:id", LivingGroupController.getById);
LivingGroupRouter.get("/living-groups/process/:processNumber", LivingGroupController.getByProcessNumber);
LivingGroupRouter.post("/living-groups", LivingGroupController.create);
LivingGroupRouter.put("/living-groups/:id", LivingGroupController.update);
LivingGroupRouter.delete("/living-groups/:id", LivingGroupController.delete);

