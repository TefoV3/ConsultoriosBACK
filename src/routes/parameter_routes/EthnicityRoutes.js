import express from "express";
import { EthnicityController } from "../../controllers/parameter_tables/EthnicityController.js";

const EthnicityRouter = express.Router();

EthnicityRouter.get("/ethnicities", EthnicityController.getAll);
EthnicityRouter.get("/ethnicities/:id", EthnicityController.getById);
EthnicityRouter.post("/ethnicities", EthnicityController.create);
EthnicityRouter.put("/ethnicities/:id", EthnicityController.update);
EthnicityRouter.delete("/ethnicities/:id", EthnicityController.delete);

