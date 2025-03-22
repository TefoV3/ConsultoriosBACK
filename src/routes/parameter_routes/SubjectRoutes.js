import express from "express";
import { SubjectController } from "../../controllers/parameter_controllers/SubjectController.js";

const SubjectRouter = express.Router();

SubjectRouter.get("/subjects", SubjectController.getAll); // Obtener todos los subjects
SubjectRouter.get("/subjects/:id", SubjectController.getById); // Obtener un subject por ID
SubjectRouter.post("/subjects", SubjectController.create); // Crear un subject
SubjectRouter.put("/subjects/:id", SubjectController.update); // Actualizar un subject por ID
SubjectRouter.delete("/subjects/:id", SubjectController.delete); // Eliminar un subject por ID

