import { Router } from "express";
import { ClientTypeController } from "../../controllers/parameter_controllers/ClientTypeController.js";

export const ClientTypeRouter = Router();

ClientTypeRouter.get("/client-types", ClientTypeController.getAll);
ClientTypeRouter.get("/client-types/:id", ClientTypeController.getById);
ClientTypeRouter.post("/client-types", ClientTypeController.create);
ClientTypeRouter.put("/client-types/:id", ClientTypeController.update);
ClientTypeRouter.delete("/client-types/:id", ClientTypeController.delete);