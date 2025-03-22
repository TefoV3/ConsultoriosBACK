import express from "express";
import { NumberOfAttemptsController } from "../../controllers/parameter_tables/NumberOfAttemptsController.js";

const NumberOfAttemptsRouter = express.Router();

NumberOfAttemptsRouter.get("/number-of-attempts", NumberOfAttemptsController.getAll);
NumberOfAttemptsRouter.get("/number-of-attempts/:id", NumberOfAttemptsController.getById);
NumberOfAttemptsRouter.post("/number-of-attempts", NumberOfAttemptsController.create);
NumberOfAttemptsRouter.put("/number-of-attempts/:id", NumberOfAttemptsController.update);
NumberOfAttemptsRouter.delete("/number-of-attempts/:id", NumberOfAttemptsController.delete);

