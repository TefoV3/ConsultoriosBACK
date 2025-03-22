import { Router } from "express";
import { ZoneSectorController } from "../../controllers/parameter_tables/ZoneSectorController.js";

export const ZoneSectorRouter = Router();

// Rutas CRUD para Zone_Sector
ZoneSectorRouter.get('/zone-sectors', ZoneSectorController.getAll);
ZoneSectorRouter.get('/zone-sectors/:id', ZoneSectorController.getById);
ZoneSectorRouter.post('/zone-sectors', ZoneSectorController.create);
ZoneSectorRouter.put('/zone-sectors/:id', ZoneSectorController.update);
ZoneSectorRouter.delete('/zone-sectors/:id', ZoneSectorController.delete);
