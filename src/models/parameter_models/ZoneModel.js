import { Zone } from "../../schemas/parameter_tables/Zone.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ZoneModel {

    static async getAll() {
        try {
            return await Zone.findAll({ where: { Zone_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Zone.findOne({
                where: { Zone_ID: id, Zone_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la zona no exista
            const existingZone = await Zone.findOne({
                where: { Zone_Name: data.Zone_Name, Zone_Status: true }
            });
            if (existingZone) {
                throw new Error(`Zone with name "${data.Zone_Name}" already exists.`);
            }
            const newRecord = await Zone.create(data);
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
                "Zone",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó una nueva zona con ID ${newRecord.Zone_ID} - Nombre: ${newRecord.Zone_Name}`
            );
                    return newRecord;
        } catch (error) {
            throw new Error(`Error creating zone: ${error.message}`);
        }
    }

        // EthnicityModel.js
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Zone.bulkCreate(data);
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
                "Zone",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} zonas.`
            );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Zonas: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            const [rowsUpdated] = await Zone.update(data, {
                where: { Zone_ID: id, Zone_Status: true }
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

            // // Describir cambios
            // let changeDetails = [];
            // if (data.hasOwnProperty('Zone_Name') && data.Zone_Name !== originalValues.Zone_Name) {
            //     changeDetails.push(`Nombre: "${originalValues.Zone_Name}" → "${data.Zone_Name}"`);
            // }
            // if (data.hasOwnProperty('Zone_Status') && data.Zone_Status !== originalValues.Zone_Status) {
            //     changeDetails.push(`Estado: "${originalValues.Zone_Status}" → "${data.Zone_Status}"`);
            // }
            // const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Zone",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la zona con ID ${id} - Nombre: ${zoneRecord.Zone_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating zone: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            await Zone.update(
                { Zone_Status: false },
                { where: { Zone_ID: id, Zone_Status: true } }
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
                "Zone",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la zona con ID ${id} - Nombre: ${zoneRecord.Zone_Name}`
            );
            return zoneRecord;
        } catch (error) {
            throw new Error(`Error deleting zone: ${error.message}`);
        }
    }
}
