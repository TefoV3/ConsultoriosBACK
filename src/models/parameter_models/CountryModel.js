import { Country } from "../../schemas/parameter_tables/Country.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";
export class CountryModel {

    static async getAll() {
        try {
            return await Country.findAll({ where: { Country_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving countries: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Country.findOne({
                where: { Country_ID: id, Country_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving country: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del país no exista
            const existingCountry = await Country.findOne({
                where: { Country_Name: data.Country_Name, Country_Status: true }
            });
            if (existingCountry) {
                throw new Error(`Country with name "${data.Country_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Country_Status = true; // Aseguramos que el país esté activo al crearlo
            data.Country_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Country.create(data);
            
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
                "Country",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de país con ID ${newRecord.Country_ID} - Nombre: ${newRecord.Country_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating country: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Country.bulkCreate(data);
            
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
                "Country",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de país.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Country: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            const [rowsUpdated] = await Country.update(data, {
                where: { Country_ID: id, Country_Status: true }
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
                "Country",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el país con ID ${id} - Nombre: ${countryRecord.Country_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating country: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            await Country.update(
                { Country_Status: false },
                { where: { Country_ID: id, Country_Status: true }
            });
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
                "Country",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el país con ID ${id} - Nombre: ${countryRecord.Country_Name}`
            );
            
            return countryRecord;
        } catch (error) {
            throw new Error(`Error deleting country: ${error.message}`);
        }
    }
}
