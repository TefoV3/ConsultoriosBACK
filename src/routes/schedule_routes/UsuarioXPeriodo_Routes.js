import { UsuarioXPeriodoController } from "../../controllers/schedule_controllers/UsuarioXPeriodo_Controller.js";
import { Router } from "express";

export const UsuarioXPeriodoRouter = Router();

// 🔹 Obtener todos los registros con sus usuarios y períodos por periodo (primero lo más específico)
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId', UsuarioXPeriodoController.getUsuariosAndPeriodosByPeriodo);

// 🔹 Obtener un registro por clave primaria compuesta (Periodo_ID y Usuario_Cedula)
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.getById);


// 🔹 Obtener todos los registros
UsuarioXPeriodoRouter.get('/usuarioXPeriodo', UsuarioXPeriodoController.getUsuarioXPeriodos);

// 🔹 Obtener todos los registros con sus usuarios y períodos
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/all', UsuarioXPeriodoController.getUsuariosAndPeriodosAll);

// 🔹 Obtener un registro por periodo y cédula
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/:periodoId/:cedula', UsuarioXPeriodoController.getByPeriodoAndCedula);

// 🔹 Obtener todos los usuarios por periodo y área
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId/area/:area', UsuarioXPeriodoController.getUsuariosByPeriodoAndArea);


// 🔹 Crear un nuevo registro
UsuarioXPeriodoRouter.post('/usuarioXPeriodo', UsuarioXPeriodoController.create);

// 🔹 Actualizar un registro por clave primaria compuesta
UsuarioXPeriodoRouter.put('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.update);

// 🔹 Eliminar (marcar como eliminado) un registro por clave primaria compuesta
UsuarioXPeriodoRouter.delete('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.delete);
