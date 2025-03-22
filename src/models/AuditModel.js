import { Audit } from "../schemas/Audit.js";
import { InternalUser } from "../schemas/Internal_User.js";

export class AuditModel {
    
    static async registerAudit(internalId, accion, tabla, descripcion) {
        try {
            // Verificar que el Internal_ID existe en la tabla internal_users
            const internalUser = await InternalUser.findOne({ where: { Internal_ID: internalId } });
            if (!internalUser) {
                throw new Error(`El Internal_ID ${internalId} no existe en la tabla internal_users`);
            }

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