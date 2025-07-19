import { Sector } from "../../schemas/parameter_tables/Sector.js";
import { Zone } from "../../schemas/parameter_tables/Zone.js"; // Importar Zone
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class SectorModel {

static async getAll() {
    try {
        return await Sector.findAll({
            where: { Sector_Status: true },
            include: {
                model: Zone, // Incluir la información de la zona asociada
                attributes: ["Zone_ID", "Zone_Name"] // Asegúrate de incluir Zone_ID
            }
        });
    } catch (error) {
        throw new Error(`Error retrieving sectors: ${error.message}`);
    }
}

    static async getById(id) {
        try {
            return await Sector.findOne({
                where: { Sector_ID: id, Sector_Status: true },
                include: {
                    model: Zone, // Incluir la información de la zona asociada
                    attributes: ["Zone_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving sector: ${error.message}`);
        }
    }

    static async getSectorZone(id) {
        try {
            const sector = await Sector.findOne({
                where: { Sector_ID: id, Sector_Status: true },
            });
            if (!sector) return null;
            const zone = await Zone.findOne({
                where: { Zone_ID: sector.Zone_FK, Zone_Status: true },
            });
            return zone;
        } catch (error) {
            throw new Error(`Error retrieving sector zone: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Sector.create(data);
            
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
                "Sector",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Sector con ID ${newRecord.Sector_ID} - Nombre: ${newRecord.Sector_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating sector: ${error.message}`);
        }
    }
    
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Sector.bulkCreate(data);
            
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
                "Sector",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Sector.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating sectors: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const sectorRecord = await this.getById(id);
            if (!sectorRecord) return null;

            const [rowsUpdated] = await Sector.update(data, {
                where: { Sector_ID: id, Sector_Status: true }
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
                "Sector",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Sector con ID ${id} - Nombre: ${sectorRecord.Sector_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating sector: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const sectorRecord = await this.getById(id);
            if (!sectorRecord) return null;

            await Sector.update(
                { Sector_Status: false },
                { where: { Sector_ID: id, Sector_Status: true } }
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
                "Sector",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la Sector con ID ${id} - Nombre: ${sectorRecord.Sector_Name}`
            );
            return sectorRecord;
        } catch (error) {
            throw new Error(`Error deleting sector: ${error.message}`);
        }
    }
}
