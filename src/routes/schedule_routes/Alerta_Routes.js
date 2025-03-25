import { AlertaController } from "../../controllers/schedule_controllers/Alerta_Controller.js";
import { Router } from "express";

export const AlertaRouter = Router();

AlertaRouter.get('/alerta', AlertaController.getAlertas);
AlertaRouter.get('/alerta/:id', AlertaController.getById);
AlertaRouter.post('/alerta', AlertaController.createAlerta);
AlertaRouter.put('/alerta/:id', AlertaController.update);
AlertaRouter.delete('/alerta/:id', AlertaController.delete);