import { Router } from "express";
import { CityController } from "../../controllers/parameter_controllers/CityController.js";
import { City } from "../../schemas/parameter_tables/City.js";

 export const CityRouter = Router();

CityRouter.get("/cities", CityController.getAll); // Obtener todas las ciudades
CityRouter.get("/cities/:id", CityController.getById); // Obtener una ciudad por ID
CityRouter.get("/cities/province/:provinceId", CityController.getByProvinceId); // Obtener ciudades por ID de provincia
CityRouter.post("/cities", CityController.create); // Crear una ciudad
CityRouter.put("/cities/:id", CityController.update); // Actualizar una ciudad por ID
CityRouter.delete("/cities/:id", CityController.delete); // Eliminar una ciudad por ID

