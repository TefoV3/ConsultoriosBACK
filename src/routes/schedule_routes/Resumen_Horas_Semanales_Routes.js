import { Resumen_Horas_Semanales_Controller } from "../../controllers/schedule_controllers/Resumen_Semanal_Controller.js";
import { Router } from "express";

export const Resumen_Horas_SemanalesRouter = Router();

// GET: Obtener todos los resúmenes semanales activos
Resumen_Horas_SemanalesRouter.get('/resumenSemanales', Resumen_Horas_Semanales_Controller.getResumenSemanales);

// GET: Obtener un resumen semanal por ID
Resumen_Horas_SemanalesRouter.get('/resumenSemanales/:id', Resumen_Horas_Semanales_Controller.getById);

// GET: Obtener los resúmenes semanales para un resumen general (por resumenGeneralId)
Resumen_Horas_SemanalesRouter.get('/resumenSemanales/resumenGeneral/:resumenGeneralId', Resumen_Horas_Semanales_Controller.getResumenesByResumenGeneral);

// POST: Crear un nuevo resumen semanal
Resumen_Horas_SemanalesRouter.post('/resumenSemanales', Resumen_Horas_Semanales_Controller.create);

// PUT: Actualizar un resumen semanal existente
Resumen_Horas_SemanalesRouter.put('/resumenSemanales/:id', Resumen_Horas_Semanales_Controller.update);

// DELETE: Realizar un borrado lógico de un resumen semanal
Resumen_Horas_SemanalesRouter.delete('/resumenSemanales/:id', Resumen_Horas_Semanales_Controller.delete);
