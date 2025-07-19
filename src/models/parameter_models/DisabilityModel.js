import { Disability } from "../../schemas/parameter_tables/Disability.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class DisabilityModel {

    static async getAll() {
        try {
            return await Disability.findAll({ where: { Disability_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Disability.findOne({
                where: { Disability_ID: id, Disability_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving disability: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la discapacidad no exista
            const existingDisability = await Disability.findOne({
                where: { Disability_Name: data.Disability_Name, Disability_Status: true }
            });
            if (existingDisability) {
                throw new Error(`Disability with name "${data.Disability_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Disability_Status = true; // Aseguramos que la discapacidad esté activa al crearlo
            data.Disability_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Disability.create(data);
            
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
                "Disability",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de discapacidad con ID ${newRecord.Disability_ID} - Nombre: ${newRecord.Disability_Name}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating disability: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Disability.bulkCreate(data);
            
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
                "Disability",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de discapacidad.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Disability: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            const [rowsUpdated] = await Disability.update(data, {
                where: { Disability_ID: id, Disability_Status: true }
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
                "Disability",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la discapacidad con ID ${id} - Nombre: ${disabilityRecord.Disability_Name}`
            );
            
            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating disability: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            await Disability.update(
                { Disability_Status: false },
                { where: { Disability_ID: id, Disability_Status: true } }
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
                "Disability",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la discapacidad con ID ${id} - Nombre: ${disabilityRecord.Disability_Name}`
            );
            
            return disabilityRecord;
        } catch (error) {
            throw new Error(`Error deleting disability: ${error.message}`);
        }
    }

}