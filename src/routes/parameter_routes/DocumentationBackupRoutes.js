import express from "express";
import { DocumentationBackupController } from "../../controllers/parameter_controllers/DocumentationBackupController.js";

const DocumentationBackupRouter = express.Router();

DocumentationBackupRouter.get("/documentation-backups", DocumentationBackupController.getAll);
DocumentationBackupRouter.get("/documentation-backups/:id", DocumentationBackupController.getById);
DocumentationBackupRouter.post("/documentation-backups", DocumentationBackupController.create);
DocumentationBackupRouter.put("/documentation-backups/:id", DocumentationBackupController.update);
DocumentationBackupRouter.delete("/documentation-backups/:id", DocumentationBackupController.delete);

