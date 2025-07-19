import { Province } from "../../schemas/parameter_tables/Province.js";
import { Country } from "../../schemas/parameter_tables/Country.js"; // Importar City para incluir la relación
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ProvinceModel {

    static async getAll() {
        try {
            return await Province.findAll({
                where: { Province_Status: true },
                include: {
                    model: Country, // Incluir la información de la ciudad asociada
                    attributes: ["Country_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving provinces: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Province.findOne({
                where: { Province_ID: id, Province_Status: true },
                include: {
                    model: Country, // Incluir la información de la ciudad asociada
                    attributes: ["Country_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving province: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Province.create(data);
            
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
                "Province",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Province con ID ${newRecord.Province_ID} - Nombre: ${newRecord.Province_Name}`
            );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating province: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Province.bulkCreate(data);
            
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
                "Province",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Province.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Province: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            const [rowsUpdated] = await Province.update(data, {
                where: { Province_ID: id, Province_Status: true }
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
                "Province",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Province con ID ${id} - Nombre: ${provinceRecord.Province_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating province: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            await Province.update(
                { Province_Status: false },
                { where: { Province_ID: id, Province_Status: true } }
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
                "Province",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Province con ID ${id} - Nombre: ${provinceRecord.Province_Name}`
            );

            return provinceRecord;
        } catch (error) {
            throw new Error(`Error deleting province: ${error.message}`);
        }
    }
}
