import { Weekly_Hours_SummaryController } from "../../controllers/schedule_controllers/Weekly_Hours_SummaryController.js";
import { Router } from "express";

export const Weekly_Hours_SummaryRouter = Router();

// GET: Obtener todos los resúmenes semanales activos
Weekly_Hours_SummaryRouter.get('/resumenSemanales', Weekly_Hours_SummaryController.getAll);

// GET: Obtener un resumen semanal por ID
Weekly_Hours_SummaryRouter.get('/resumenSemanales/:id', Weekly_Hours_SummaryController.getById);

// GET: Obtener los resúmenes semanales para un resumen general (por resumenGeneralId)
Weekly_Hours_SummaryRouter.get('/resumenSemanales/resumenGeneral/:generalSummaryId', Weekly_Hours_SummaryController.getByGeneralSummaryId);

// POST: Crear un nuevo resumen semanal
Weekly_Hours_SummaryRouter.post('/resumenSemanales', Weekly_Hours_SummaryController.create);

// PUT: Actualizar un resumen semanal existente
Weekly_Hours_SummaryRouter.put('/resumenSemanales/:id', Weekly_Hours_SummaryController.update);

// DELETE: Realizar un borrado lógico de un resumen semanal
Weekly_Hours_SummaryRouter.delete('/resumenSemanales/:id', Weekly_Hours_SummaryController.delete);
