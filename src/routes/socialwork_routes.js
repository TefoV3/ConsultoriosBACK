import { Router } from "express";
import { SocialWorkController } from "../controllers/SocialWorkController.js";

export const SocialWorkRouter = Router();

SocialWorkRouter.get("/socialwork", SocialWorkController.getAll);
SocialWorkRouter.get("/socialwork/:id", SocialWorkController.getById);
SocialWorkRouter.get("/socialwork/user/:initCode", SocialWorkController.getUserIdBySocialWork);
SocialWorkRouter.post("/socialwork", SocialWorkController.create);
SocialWorkRouter.put("/socialwork/:id", SocialWorkController.update);
SocialWorkRouter.delete("/socialwork/:id", SocialWorkController.delete);


