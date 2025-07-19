import { Period_Type } from "../../schemas/parameter_tables/Period_Type.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class PeriodTypeModel {

    static async getAll() {
        try {
            return await Period_Type.findAll({
                where: { Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Period_Type.findOne({
                where: { Period_Type_ID: id, Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period type: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del tipo de periodo no exista
            const existingPeriodType = await Period_Type.findOne({
                where: { Period_Type_Name: data.Period_Type_Name, Period_Type_Status: true }
            });
            if (existingPeriodType) {
                throw new Error(`Period Type with name "${data.Period_Type_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Period_Type_Status = true; // Aseguramos que el tipo de periodo esté activo al crearlo
            data.Period_Type_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Period_Type.create(data);
            
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
                "Period_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Period_Type con ID ${newRecord.Period_Type_ID} - Nombre: ${newRecord.Period_Type_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating period type: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Period_Type.bulkCreate(data)
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
                "Period_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Period_Type.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Period Type: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            const [rowsUpdated] = await Period_Type.update(data, {
                where: { Period_Type_ID: id, Period_Type_Status: true }
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
                "Period_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Period_Type con ID ${id} - Nombre: ${periodTypeRecord.Period_Type_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating period type: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            await Period_Type.update(
                { Period_Type_Status: false },
                { where: { Period_Type_ID: id, Period_Type_Status: true } }
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
                "Period_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Period_Type con ID ${id} - Nombre: ${periodTypeRecord.Period_Type_Name}`
            );
            
            return periodTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting period type: ${error.message}`);
        }
    }
}
