import { Audit } from "../schemas/Audit.js";

export class AuditModel {
    
    static async registerAudit(req, accion, tabla, descripcion) {
        try {
            const internalId = req.session.user?.Internal_ID || "Sistema";

            return await Audit.create({
                Internal_ID: internalId,
                Audit_Accion: accion,
                Audit_Tabla: tabla,
                Audit_Descripcion: descripcion
            });
        } catch (error) {
            console.error(`Error al registrar auditoría: ${error.message}`);
        }
    }

    static async getAudits() {
        try {
            return await Audit.findAll({ order: [["Audit_Fecha", "DESC"]] });
        } catch (error) {
            throw new Error(`Error al obtener auditorías: ${error.message}`);
        }
    }
}
