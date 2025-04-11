import { HorasExtraordinariasController } from "../../controllers/schedule_controllers/Horas_Extraordinarias_Controller.js";
import { Router } from "express";

export const HorasExtraordinariasRouter = Router();

HorasExtraordinariasRouter.get('/horasExtraordinarias', HorasExtraordinariasController.getHoras_Extraordinarias);
HorasExtraordinariasRouter.get('/horasExtraordinarias/:id', HorasExtraordinariasController.getById);

// Ruta POST específica para registrar horas extraordinarias con actualización del resumen
HorasExtraordinariasRouter.post('/horasExtraordinarias/createConResumen', HorasExtraordinariasController.createHorasExtraordinariasConResumen);
HorasExtraordinariasRouter.post('/horasExtraordinarias', HorasExtraordinariasController.createHoras_Extraordinarias);


HorasExtraordinariasRouter.put('/horasExtraordinarias/:id', HorasExtraordinariasController.update);
HorasExtraordinariasRouter.delete('/horasExtraordinarias/:id', HorasExtraordinariasController.delete);
HorasExtraordinariasRouter.get('/horasExtraordinariasByUser/:id', HorasExtraordinariasController.getHoras_ExtraordinariasByUser);