import { Vulnerable_Situation } from "../../schemas/parameter_tables/Vulnerable_Situation.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class VulnerableSituationModel {

    static async getAll() {
        try {
            return await Vulnerable_Situation.findAll({ where: { Vulnerable_Situation_Status: true } });
        }
        catch (error) {
            throw new Error(`Error retrieving vulnerable situations: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Vulnerable_Situation.findOne({
                where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving vulnerable situation: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre no exista
            const existingRecord = await Vulnerable_Situation.findOne({
                where: {
                    Vulnerable_Situation_Name: data.Vulnerable_Situation_Name,
                    Vulnerable_Situation_Status: true
                }
            });
            if (existingRecord) {
                throw new Error(`Ya existe un registro de Vulnerable_Situation con el nombre ${data.Vulnerable_Situation_Name}`);
            }
            const newRecord = await Vulnerable_Situation.create(data);
            
            // Auditoría detallada
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Vulnerable_Situation",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Vulnerable_Situation con ID ${newRecord.Vulnerable_Situation_ID} - Nombre: ${newRecord.Vulnerable_Situation_Name}`
            );
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating vulnerable situation: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Vulnerable_Situation.bulkCreate(data);
            
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Vulnerable_Situation",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Vulnerable_Situation.`
            );
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Vulnerable Situation: ${error.message}`);
        }
    } 
    static async update(id, data, internalId) {
        try {
            const vulnerableSituationRecord = await this.getById(id);
            if (!vulnerableSituationRecord) return null;

            const [rowsUpdated] = await Vulnerable_Situation.update(data, {
                where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Vulnerable_Situation",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Vulnerable_Situation con ID ${id} - Nombre: ${vulnerableSituationRecord.Vulnerable_Situation_Name}`
            );
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating vulnerable situation: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const vulnerableSituationRecord = await this.getById(id);
            if (!vulnerableSituationRecord) return null;

            await Vulnerable_Situation.update(
                { Vulnerable_Situation_Status: false },
                { where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true } }
            );

            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Vulnerable_Situation",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Vulnerable_Situation con ID ${id} - Nombre: ${vulnerableSituationRecord.Vulnerable_Situation_Name}`
            );
            return vulnerableSituationRecord;
        } catch (error) {
            throw new Error(`Error deleting vulnerable situation: ${error.message}`);
        }
    }

}









