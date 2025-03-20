import { Router } from "express";
import { ParametersController } from "../controllers/ParametersController.js";

export const ParametersRouter = Router();
/*ZONE --> SECTOR*/ 
ParametersRouter.get("/parameters/zone/:zone", ParametersController.getByZone);
ParametersRouter.post("/parameters", ParametersController.create);
ParametersRouter.put("/parameters/:zone/:sector", ParametersController.update);
ParametersRouter.delete("/parameters/:id", ParametersController.delete);
/*Province*/ 
ParametersRouter.post("/parameters/province", ParametersController.createProvince); 
ParametersRouter.get("/parameters/provinces", ParametersController.getAllProvince); 
ParametersRouter.put("/parameters/province/:id", ParametersController.updateProvince); 
ParametersRouter.delete("/parameters/province/:id", ParametersController.deleteProvince);
/* City */
ParametersRouter.post("/parameters/city", ParametersController.createCity);
ParametersRouter.get("/parameters/cities", ParametersController.getAllCity);
ParametersRouter.put("/parameters/city/:id", ParametersController.updateCity);
ParametersRouter.delete("/parameters/city/:id", ParametersController.deleteCity);