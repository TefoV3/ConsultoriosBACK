import { AuditModel } from "../models/AuditModel.js";

export class AuditController {
    static async registerAudit(req, res) {
        try {
            const { User_ID, Audit_Accion, Audit_Tabla, Audit_Descripcion } = req.body;

            if (!User_ID || !Audit_Accion || !Audit_Tabla || !Audit_Descripcion) {
                return res.status(400).json({ error: "Todos los campos son obligatorios" });
            }

            const newAudit = await AuditModel.registerAudit(User_ID, Audit_Accion, Audit_Tabla, Audit_Descripcion);
            res.status(201).json({ message: "Auditoría registrada", data: newAudit });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAudits(req, res) {
        try {
            const audits = await AuditModel.getAudits();
            res.json(audits);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
