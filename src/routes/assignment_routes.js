import { AssignmentController } from "../controllers/AssignmentController.js";
import { Router } from "express";

export const AssignmentRouter = Router();

AssignmentRouter.get('/asignacion', AssignmentController.getAssignments);
AssignmentRouter.get('/asignacion/:id', AssignmentController.getById);
AssignmentRouter.post('/asignacion', AssignmentController.createAssignment);
AssignmentRouter.put('/asignacion/:id', AssignmentController.update);
AssignmentRouter.delete('/asignacion/:id', AssignmentController.delete);
AssignmentRouter.post('/asignacion/equitativa', AssignmentController.assignCasesEquitably);