import { Router } from "express";
import { SectorController } from "../../controllers/parameter_controllers/SectorController.js";

export const SectorRouter = Router();

SectorRouter.get("/sectors", SectorController.getAll); // Obtener todos los sectores
SectorRouter.get("/sectors/:id", SectorController.getById); // Obtener un sector por ID
SectorRouter.get("/sectors/zone/:id", SectorController.getSectorZone); // Obtener sectores por ID de zona
SectorRouter.post("/sectors", SectorController.create); // Crear un sector
SectorRouter.put("/sectors/:id", SectorController.update); // Actualizar un sector por ID
SectorRouter.delete("/sectors/:id", SectorController.delete); // Eliminar un sector por ID

