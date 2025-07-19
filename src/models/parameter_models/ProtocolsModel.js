import { Protocols } from "../../schemas/parameter_tables/Protocols.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ProtocolsModel {

    static async getAll() {
        try {
            return await Protocols.findAll({ where: { Protocol_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving protocols: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Protocols.findOne({
                where: { Protocol_ID: id, Protocol_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving protocol: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Protocols.create(data);
            
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
                "Protocols",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de protocolo con ID ${newRecord.Protocol_ID} - Nombre: ${newRecord.Protocol_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating protocol: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Protocols.bulkCreate(data);
            
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
                "Protocols",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de protocolo.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Protocols: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            const [rowsUpdated] = await Protocols.update(data, {
                where: { Protocol_ID: id, Protocol_Status: true }
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
                "Protocols",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el protocolo con ID ${id} - Nombre: ${protocolRecord.Protocol_Name}`
            );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating protocol: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            await Protocols.update(
                { Protocol_Status: false },
                { where: { Protocol_ID: id, Protocol_Status: true } }
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
                "Protocols",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el protocolo con ID ${id} - Nombre: ${protocolRecord.Protocol_Name}`
            );

            return protocolRecord;
        } catch (error) {
            throw new Error(`Error deleting protocol: ${error.message}`);
        }
    }
}