import { City } from "../../schemas/parameter_tables/City.js";
import { Province } from "../../schemas/parameter_tables/Province.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class CityModel {

    static async getAll() {
        try {
            return await City.findAll({
                where: { City_Status: true },
                include: {
                    model: Province, // Incluir información de Country
                    attributes: ["Province_Name"] // Campos que deseas incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving cities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await City.findOne({
                where: { City_ID: id, City_Status: true },
                include: {
                    model: Province, // Incluir información de Country
                    attributes: ["Province_Name"] // Campos que deseas incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving city: ${error.message}`);
        }
    }

    static async getByProvinceId(provinceId) {
        try {
            return await City.findAll({
                where: { Province_FK: provinceId, City_Status: true },
            });
        } catch (error) {
            throw new Error(`Error retrieving cities by province ID: ${error.message}`);
        }
    }



    static async create(data, internalId) {
        try {
            // Validar que el nombre de la ciudad no exista en la misma provincia
            const existingCity = await City.findOne({
                where: {
                    City_Name: data.City_Name,
                    Province_FK: data.Province_FK,
                    City_Status: true
                }
            });
            if (existingCity) {
                throw new Error(`City with name "${data.City_Name}" already exists in the specified province.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.City_Status = true; // Aseguramos que la ciudad esté activa al crearlo
            data.City_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await City.create(data);

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
                "City",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de ciudad con ID ${newRecord.City_ID} - Nombre: ${newRecord.City_Name}`
            );

            return newRecord
        } catch (error) {
            throw new Error(`Error creating city: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            const [rowsUpdated] = await City.update(data, {
                where: { City_ID: id, City_Status: true }
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
                "City",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la ciudad con ID ${id} - Nombre: ${cityRecord.City_Name}`
            );

            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating city: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            await City.update(
                { City_Status: false },
                { where: { City_ID: id, City_Status: true } }
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
                "City",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la ciudad con ID ${id} - Nombre: ${cityRecord.City_Name}`
            );
            
            return cityRecord;
        } catch (error) {
            throw new Error(`Error deleting city: ${error.message}`);
        }
    }
}
