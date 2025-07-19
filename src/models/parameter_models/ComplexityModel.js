import { Complexity } from "../../schemas/parameter_tables/Complexity.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ComplexityModel {

    static async getAll() {
        try {
            return await Complexity.findAll({
                where: { Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Complexity.findOne({
                where: { Complexity_ID: id, Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la complejidad no exista
            const existingComplexity = await Complexity.findOne({
                where: { Complexity_Name: data.Complexity_Name, Complexity_Status: true }
            });
            if (existingComplexity) {
                throw new Error(`Complexity with name "${data.Complexity_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Complexity_Status = true; // Aseguramos que la complejidad esté activa al crearlo
            data.Complexity_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Complexity.create(data);
            
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
                "Complexity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de complejidad con ID ${newRecord.Complexity_ID} - Nombre: ${newRecord.Complexity_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating complexity: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Complexity.bulkCreate(data);
            
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
                "Complexity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de complejidad.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Complexity: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            const [rowsUpdated] = await Complexity.update(data, {
                where: { Complexity_ID: id, Complexity_Status: true }
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
                "Complexity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la complejidad con ID ${id} - Nombre: ${complexityRecord.Complexity_Name}`
            );
            
            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating complexity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            await Complexity.update(
                { Complexity_Status: false },
                { where: { Complexity_ID: id, Complexity_Status: true } }
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
                "Complexity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la complejidad con ID ${id} - Nombre: ${complexityRecord.Complexity_Name}`
            );
            
            return complexityRecord;
        } catch (error) {
            throw new Error(`Error deleting complexity: ${error.message}`);
        }
    }
}
