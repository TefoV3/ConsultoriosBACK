import { AssignmentController } from "../controllers/AsignacionController.js";
import { Router } from "express";

export const AsignacionRouter = Router();

AsignacionRouter.get('/asignacion', AssignmentController.getAssignments);
AsignacionRouter.get('/asignacion/:id', AssignmentController.getById);
AsignacionRouter.post('/asignacion', AssignmentController.createAssignment);
AsignacionRouter.put('/asignacion/:id', AssignmentController.update);
AsignacionRouter.delete('/asignacion/:id', AssignmentController.delete);