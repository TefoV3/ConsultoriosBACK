import { Own_Assets } from "../../schemas/parameter_tables/Own_Assets.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class OwnAssetsModel {
    
    static async getAll() {
        try {
            return await Own_Assets.findAll({ where: { Own_Assets_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Own_Assets.findOne({
                where: { Own_Assets_ID: id, Own_Assets_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del activo no exista
            const existingOwnAsset = await Own_Assets.findOne({
                where: { Own_Assets_Name: data.Own_Assets_Name, Own_Assets_Status: true }
            });
            if (existingOwnAsset) {
                throw new Error(`Own Asset with name "${data.Own_Assets_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Own_Assets_Status = true; // Aseguramos que el activo esté activo al crearlo
            data.Own_Assets_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Own_Assets.create(data);
            
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
                "Own_Assets",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Own_Assets con ID ${newRecord.Own_Assets_ID} - Nombre: ${newRecord.Own_Assets_Name}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Own_Assets.bulkCreate(data);
            
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
                "Own_Assets",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Own_Assets.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Own Assets: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            const [rowsUpdated] = await Own_Assets.update(data, {
                where: { Own_Assets_ID: id, Own_Assets_Status: true }
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
                "Own_Assets",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Own_Assets con ID ${id} - Nombre: ${Own_AssetsRecord.Own_Assets_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            await Own_Assets.update(
                { Own_Assets_Status: false },
                { where: { Own_Assets_ID: id, Own_Assets_Status: true } }
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
                "Own_Assets",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Own_Assets con ID ${id} - Nombre: ${Own_AssetsRecord.Own_Assets_Name}`
            );
            return Own_AssetsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
