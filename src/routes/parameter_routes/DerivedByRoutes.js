import { Router } from "express";
import { DerivedByController } from "../../controllers/parameter_controllers/DerivedByController.js";

export const DerivedByRouter = Router();

DerivedByRouter.get("/derived-by", DerivedByController.getAll);
DerivedByRouter.get("/derived-by/:id", DerivedByController.getById);
DerivedByRouter.post("/derived-by", DerivedByController.create);
DerivedByRouter.put("/derived-by/:id", DerivedByController.update);
DerivedByRouter.delete("/derived-by/:id", DerivedByController.delete);

