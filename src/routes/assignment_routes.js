import { AssignmentController } from "../controllers/AssignmentController.js";
import { Router } from "express";

export const AssignmentRouter = Router();

AssignmentRouter.get('/assignment', AssignmentController.getAssignments);
AssignmentRouter.get('/assignment/:id', AssignmentController.getById);
AssignmentRouter.get('/assignment/studentid/:id', AssignmentController.getAssignmentsByStudentId);
AssignmentRouter.get('/assignment/student/initcode/:initCode', AssignmentController.getStudentByInitCode);

AssignmentRouter.post('/assignment', AssignmentController.createAssignment);
AssignmentRouter.put('/assignment/:id', AssignmentController.update);
AssignmentRouter.delete('/assignment/:id', AssignmentController.delete);
AssignmentRouter.post('/assignment/equitativa', AssignmentController.assignCasesEquitably);