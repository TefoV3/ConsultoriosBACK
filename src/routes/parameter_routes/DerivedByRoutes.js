import express from "express";
import { DerivedByController } from "../../controllers/parameter_tables/DerivedByController.js";

const DerivedByRouter = express.Router();

DerivedByRouter.get("/derived-by", DerivedByController.getAll);
DerivedByRouter.get("/derived-by/:id", DerivedByController.getById);
DerivedByRouter.post("/derived-by", DerivedByController.create);
DerivedByRouter.put("/derived-by/:id", DerivedByController.update);
DerivedByRouter.delete("/derived-by/:id", DerivedByController.delete);

