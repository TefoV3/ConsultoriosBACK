import { Router } from "express";
import { AuditController } from "../controllers/AuditController.js";

export const AuditRouter = Router();

AuditRouter.get("/audits", AuditController.getAudits);
AuditRouter.post("/audits", AuditController.registerAudit);

export default AuditRouter;
