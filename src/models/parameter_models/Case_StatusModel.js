import { Case_Status } from "../../schemas/parameter_tables/Case_Status.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class CaseStatusModel {
    
    static async getAll() {
        try {
            return await Case_Status.findAll({ where: { Case_Status_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Case_Status.findOne({
                where: { Case_Status_ID: id, Case_Status_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del estado del caso no exista
            const existingCaseStatus = await Case_Status.findOne({
                where: { Case_Status_Name: data.Case_Status_Name, Case_Status_Status: true }
            });
            if (existingCaseStatus) {
                throw new Error(`Case Status with name "${data.Case_Status_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Case_Status_Status = true; // Aseguramos que el estado del caso esté activo al crearlo
            data.Case_Status_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental



            const newRecord = await Case_Status.create(data);

            // Auditoría
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
                "Case_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo estado de caso con ID ${newRecord.Case_Status_ID} - Nombre: ${newRecord.Case_Status_Name}`
            );

            return newRecord;

        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Case_Status.bulkCreate(data);

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
                "Case_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} estados de caso.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Case Status: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            const [rowsUpdated] = await Case_Status.update(data, {
                where: { Case_Status_ID: id, Case_Status_Status: true }
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
                "Case_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el estado de caso con ID ${id} - Nombre: ${caseStatusRecord.Case_Status_Name}`
            );
             
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            await Case_Status.update(
                { Case_Status_Status: false },
                { where: { Case_Status_ID: id, Case_Status_Status: true } }
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
                "Case_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el estado de caso con ID ${id} - Nombre: ${caseStatusRecord.Case_Status_Name}`
            );
            
            return caseStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
