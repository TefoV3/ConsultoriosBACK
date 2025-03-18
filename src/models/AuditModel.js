import { Audit } from "../schemas/Audit.js";

export class AuditModel {
    
    static async registerAudit(userID, accion, tabla, descripcion) {
        try {
            return await Audit.create({
                User_ID: userID || "Sistema",  // Si no hay usuario, se registra como "Sistema"
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
