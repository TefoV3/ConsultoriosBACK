import express from "express";
import { CityController } from "../../controllers/parameter_controllers/CityController.js";

const CityRouter = express.Router();

CityRouter.get("/cities", CityController.getAll); // Obtener todas las ciudades
CityRouter.get("/cities/:id", CityController.getById); // Obtener una ciudad por ID
CityRouter.post("/cities", CityController.create); // Crear una ciudad
CityRouter.put("/cities/:id", CityController.update); // Actualizar una ciudad por ID
CityRouter.delete("/cities/:id", CityController.delete); // Eliminar una ciudad por ID

