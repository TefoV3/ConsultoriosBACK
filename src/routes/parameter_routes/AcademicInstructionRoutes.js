import express from "express";
import { AcademicInstructionController } from "../../controllers/parameter_tables/AcademicInstructionController.js";

const AcademicInstructionRouter = express.Router();

AcademicInstructionRouter.get("/academic-instructions", AcademicInstructionController.getAll);
AcademicInstructionRouter.get("/academic-instructions/:id", AcademicInstructionController.getById);
AcademicInstructionRouter.post("/academic-instructions", AcademicInstructionController.create);
AcademicInstructionRouter.put("/academic-instructions/:id", AcademicInstructionController.update);
AcademicInstructionRouter.delete("/academic-instructions/:id", AcademicInstructionController.delete);


