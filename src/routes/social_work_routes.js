import { Router } from "express";
import { SocialWorkController } from "../controllers/SocialWorkController.js";

export const SocialWorkRouter = Router();

SocialWorkRouter.get("/social-work", SocialWorkController.getAll);
SocialWorkRouter.get("/social-work/:id", SocialWorkController.getById);
SocialWorkRouter.get("/social-work/user/:initCode", SocialWorkController.getUserIdBySocialWork);
SocialWorkRouter.post("/social-work", SocialWorkController.create);
SocialWorkRouter.put("/social-work/:id", SocialWorkController.update);
SocialWorkRouter.delete("/social-work/:id", SocialWorkController.delete);


