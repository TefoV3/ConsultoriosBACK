import express from "express";
import { ProvinceController } from "../../controllers/parameter_tables/ProvinceController.js";

const ProvinceRouter = express.Router();

ProvinceRouter.get("/provinces", ProvinceController.getAll); // Obtener todas las provincias
ProvinceRouter.get("/provinces/:id", ProvinceController.getById); // Obtener una provincia por ID
ProvinceRouter.post("/provinces", ProvinceController.create); // Crear una provincia
ProvinceRouter.put("/provinces/:id", ProvinceController.update); // Actualizar una provincia por ID
ProvinceRouter.delete("/provinces/:id", ProvinceController.delete); // Eliminar una provincia por ID

