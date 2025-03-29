import { UsuarioXPeriodoController } from "../../controllers/schedule_controllers/UsuarioXPeriodo_Controller.js";
import { Router } from "express";

export const UsuarioXPeriodoRouter = Router();

// 🔹 Obtener todos los registros con sus usuarios y períodos por periodo
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId/area/:area', UsuarioXPeriodoController.getUsuariosByPeriodoAndArea);

UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId', UsuarioXPeriodoController.getUsuariosAndPeriodosByPeriodo);

// 🔹 Obtener todos los registros con sus usuarios y períodos
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/all', UsuarioXPeriodoController.getUsuariosAndPeriodosAll);

// 🔹 Obtener todos los registros por cédula
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/usuario/:usuarioCedula', UsuarioXPeriodoController.getByCedula);

// 🔹 Obtener un registro por clave primaria compuesta
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.getById);

// 🔹 (opcional) Esta parece duplicada con la de arriba
//UsuarioXPeriodoRouter.get('/usuarioXPeriodo/:periodoId/:cedula', UsuarioXPeriodoController.getByPeriodoAndCedula);

// 🔹 Obtener todos los registros
UsuarioXPeriodoRouter.get('/usuarioXPeriodo', UsuarioXPeriodoController.getUsuarioXPeriodos);

// 🔹 Crear un nuevo registro
UsuarioXPeriodoRouter.post('/usuarioXPeriodo', UsuarioXPeriodoController.create);

// 🔹 Actualizar un registro
UsuarioXPeriodoRouter.put('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.update);

// 🔹 Eliminar un registro
UsuarioXPeriodoRouter.delete('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.delete);

