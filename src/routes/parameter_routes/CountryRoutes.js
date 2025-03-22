import { Router } from "express";
import { CountryController } from "../../controllers/parameter_tables/CountryController.js";

export const CountryRouter = Router();

CountryRouter.get('/countries', CountryController.getAll);
CountryRouter.get('/countries/:id', CountryController.getById);
CountryRouter.post('/countries', CountryController.create);
CountryRouter.put('/countries/:id', CountryController.update);
CountryRouter.delete('/countries/:id', CountryController.delete);
