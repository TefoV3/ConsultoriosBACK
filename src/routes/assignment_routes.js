import { AssignmentController } from "../controllers/AssignmentController.js";
import { Router } from "express";

export const AssignmentRouter = Router();

AssignmentRouter.get('/assignment', AssignmentController.getAssignments);
AssignmentRouter.get('/assignment/:id', AssignmentController.getById);
AssignmentRouter.get('/assignment/studentid/:id', AssignmentController.getAssignmentsByStudentId);
AssignmentRouter.get('/assignment/student/initcode/:initCode', AssignmentController.getStudentByInitCode);
AssignmentRouter.get('/assignment/cases/all', AssignmentController.getAllWithDetails);

AssignmentRouter.post('/assignment', AssignmentController.createAssignment);
AssignmentRouter.put('/assignment/:id', AssignmentController.update);
AssignmentRouter.delete('/assignment/:id', AssignmentController.delete);
AssignmentRouter.post('/assignment/assign-pending-by-area', AssignmentController.assignPendingByArea);

AssignmentRouter.put('/assignment/initcode/:initCode', AssignmentController.updateByInitCode);
