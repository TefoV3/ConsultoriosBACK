import { Family_Group } from "../../schemas/parameter_tables/Family_Group.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class FamilyGroupModel {
    
    static async getAll() {
        try {
            return await Family_Group.findAll({ where: { Family_Group_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Group.findOne({
                where: { Family_Group_ID: id, Family_Group_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del grupo familiar no exista
            const existingFamilyGroup = await Family_Group.findOne({
                where: { Family_Group_Name: data.Family_Group_Name, Family_Group_Status: true }
            });
            if (existingFamilyGroup) {
                throw new Error(`Family Group with name "${data.Family_Group_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Family_Group_Status = true; // Aseguramos que el grupo familiar esté activo al crearlo
            data.Family_Group_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Family_Group.create(data);
            
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
                "Family_Group",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de grupo familiar con ID ${newRecord.Family_Group_ID} - Nombre: ${newRecord.Family_Group_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Family_Group.bulkCreate(data);
            
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
                "Family_Group",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de grupo familiar.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Family Group: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            const [rowsUpdated] = await Family_Group.update(data, {
                where: { Family_Group_ID: id, Family_Group_Status: true }
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
                "Family_Group",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el grupo familiar con ID ${id} - Nombre: ${Family_GroupRecord.Family_Group_Name}`
            );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            await Family_Group.update(
                { Family_Group_Status: false },
                { where: { Family_Group_ID: id, Family_Group_Status: true } }
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
                "Family_Group",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el grupo familiar con ID ${id} - Nombre: ${Family_GroupRecord.Family_Group_Name}`
            );

            return Family_GroupRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
