import { Router } from "express";
import { ProvinceController } from "../../controllers/parameter_controllers/ProvinceController.js";

export const ProvinceRouter = Router();

ProvinceRouter.get("/provinces", ProvinceController.getAll); // Obtener todas las provincias
ProvinceRouter.get("/provinces/:id", ProvinceController.getById); // Obtener una provincia por ID
ProvinceRouter.post("/provinces", ProvinceController.create); // Crear una provincia
ProvinceRouter.put("/provinces/:id", ProvinceController.update); // Actualizar una provincia por ID
ProvinceRouter.delete("/provinces/:id", ProvinceController.delete); // Eliminar una provincia por ID

