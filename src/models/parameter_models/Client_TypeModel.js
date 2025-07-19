import { Client_Type } from "../../schemas/parameter_tables/Client_Type.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ClientTypeModel {
    static async getAll() {
        try {
            return await Client_Type.findAll({
                where: { Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Client_Type.findOne({
                where: { Client_Type_ID: id, Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client type: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del tipo de cliente no exista
            const existingClientType = await Client_Type.findOne({
                where: { Client_Type_Name: data.Client_Type_Name, Client_Type_Status: true }
            });
            if (existingClientType) {
                throw new Error(`Client Type with name "${data.Client_Type_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Client_Type_Status = true; // Aseguramos que el tipo de cliente esté activo al crearlo
            data.Client_Type_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Client_Type.create(data);
            
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
                "Client_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de tipo de cliente con ID ${newRecord.Client_Type_ID} - Nombre: ${newRecord.Client_Type_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating client type: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Client_Type.bulkCreate(data);
            
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
                "Client_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de tipo de cliente.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Client Type: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            const [rowsUpdated] = await Client_Type.update(data, {
                where: { Client_Type_ID: id, Client_Type_Status: true }
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
                "Client_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el tipo de cliente con ID ${id} - Nombre: ${clientTypeRecord.Client_Type_Name}`
            );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating client type: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            await Client_Type.update(
                { Client_Type_Status: false },
                { where: { Client_Type_ID: id, Client_Type_Status: true } }
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
                "Client_Type",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el tipo de cliente con ID ${id} - Nombre: ${clientTypeRecord.Client_Type_Name}`
            );
            return clientTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting client type: ${error.message}`);
        }
    }

}