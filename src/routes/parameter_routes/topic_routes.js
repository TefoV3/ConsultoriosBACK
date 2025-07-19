import { Router } from "express";
import { TopicController } from "../../controllers/parameter_controllers/TopicController.js";

export const TopicRouter = Router();

TopicRouter.get("/topics", TopicController.getAll); // Obtener todos los topics
TopicRouter.get("/topics/:id", TopicController.getById); // Obtener un topic por ID
TopicRouter.get("/topics/subject/:subjectId", TopicController.getBySubjectId); // Obtener topics por ID de materia
TopicRouter.post("/topics", TopicController.create); // Crear un topic
TopicRouter.put("/topics/:id", TopicController.update); // Actualizar un topic por ID
TopicRouter.delete("/topics/:id", TopicController.delete); // Eliminar un topic por ID

