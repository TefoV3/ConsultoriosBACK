import { Occupations } from "../../schemas/parameter_tables/Occupations.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class OccupationsModel {
    
    static async getAll() {
        try {
            return await Occupations.findAll({ where: { Occupation_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Occupations.findOne({
                where: { Occupation_ID: id, Occupation_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la ocupación no exista
            const existingOccupation = await Occupations.findOne({
                where: { Occupation_Name: data.Occupation_Name, Occupation_Status: true }
            });
            if (existingOccupation) {
                throw new Error(`Occupation with name "${data.Occupation_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Occupation_Status = true; // Aseguramos que la ocupación esté activa al crearlo
            data.Occupation_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Occupations.create(data);
            
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
                "Occupations",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de ocupación con ID ${newRecord.Occupation_ID} - Nombre: ${newRecord.Occupation_Name}`
            );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Occupations.bulkCreate(data);
            
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
                "Occupations",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de ocupación.`
            );

            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Occupations: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            const [rowsUpdated] = await Occupations.update(data, {
                where: { Occupation_ID: id, Occupation_Status: true }
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
                "Occupations",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la ocupación con ID ${id} - Nombre: ${OccupationsRecord.Occupation_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            await Occupations.update(
                { Occupation_Status: false },
                { where: { Occupation_ID: id, Occupation_Status: true } }
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
                "Occupations",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la ocupación con ID ${id} - Nombre: ${occupationRecord.Occupation_Name}`
            );

            return OccupationsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
