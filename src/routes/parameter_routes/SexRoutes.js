import express from "express";
import { SexController } from "../../controllers/parameter_tables/SexController.js";

const SexRouter = express.Router();

SexRouter.get("/sexes", SexController.getAll);
SexRouter.get("/sexes/:id", SexController.getById);
SexRouter.post("/sexes", SexController.create);
SexRouter.put("/sexes/:id", SexController.update);
SexRouter.delete("/sexes/:id", SexController.delete);

