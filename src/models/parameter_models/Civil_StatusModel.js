import { Civil_Status } from "../../schemas/parameter_tables/Civil_Status.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class CivilStatusModel {

    static async getAll() {
        try {
            return await Civil_Status.findAll({
                where: { Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil statuses: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Civil_Status.findOne({
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del estado civil no exista
            const existingCivilStatus = await Civil_Status.findOne({
                where: { Civil_Status_Name: data.Civil_Status_Name, Civil_Status_Status: true }
            });
            if (existingCivilStatus) {
                throw new Error(`Civil Status with name "${data.Civil_Status_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Civil_Status_Status = true; // Aseguramos que el estado civil esté activo al crearlo
            data.Civil_Status_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Civil_Status.create(data);
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
                "Civil_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de estado civil con ID ${newRecord.Civil_Status_ID} - Nombre: ${newRecord.Civil_Status_Name}`
            );
            return newRecord
        } catch (error) {
            throw new Error(`Error creating civil status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Civil_Status.bulkCreate(data);
            
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
                "Civil_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de estado civil.`
            );
            
            return createdRecords; // Usa el bulkCreate de Sequelize

        } catch (error) {
            throw new Error(`Error creating Civil Status: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            const [rowsUpdated] = await Civil_Status.update(data, {
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
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
                "Civil_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el estado civil con ID ${id} - Nombre: ${civilStatusRecord.Civil_Status_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating civil status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            await Civil_Status.update(
                { Civil_Status_Status: false },
                { where: { Civil_Status_ID: id, Civil_Status_Status: true } }
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
                "Civil_Status",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el estado civil con ID ${id} - Nombre: ${civilStatusRecord.Civil_Status_Name}`
            );

            return civilStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting civil status: ${error.message}`);
        }
    }
}
