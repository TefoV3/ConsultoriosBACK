import { UsuarioXPeriodoController } from "../../controllers/schedule_controllers/UsuarioXPeriodo_Controller.js";
import { Router } from "express";

export const UsuarioXPeriodoRouter = Router();

// Rutas más específicas:
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId/area/:area', UsuarioXPeriodoController.getUsuariosByPeriodoAndArea);
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/periodo/:periodoId', UsuarioXPeriodoController.getUsuariosAndPeriodosByPeriodo);
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/all', UsuarioXPeriodoController.getUsuariosAndPeriodosAll);
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/usuario/:usuarioCedula', UsuarioXPeriodoController.getByCedula);

// Ruta para obtener un registro por clave primaria compuesta:
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.getById);

// Ruta específica para obtener un registro por UsuarioXPeriodo_ID (sin conflicto)
UsuarioXPeriodoRouter.get('/usuarioXPeriodo/id/:usuarioXPeriodoId', UsuarioXPeriodoController.getByUsuarioXPeriodoId);

// Ruta para obtener todos los registros (general)
UsuarioXPeriodoRouter.get('/usuarioXPeriodo', UsuarioXPeriodoController.getUsuarioXPeriodos);

// Crear un nuevo registro
UsuarioXPeriodoRouter.post('/usuarioXPeriodo', UsuarioXPeriodoController.create);

// Actualizar un registro
UsuarioXPeriodoRouter.put('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.update);

// Eliminar un registro
UsuarioXPeriodoRouter.delete('/usuarioXPeriodo/:periodoId/:usuarioCedula', UsuarioXPeriodoController.delete);
