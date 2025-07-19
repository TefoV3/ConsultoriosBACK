import { Profiles } from "../../schemas/parameter_tables/Profiles.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ProfilesModel {


    static async getAll() {
        try {
            return await Profiles.findAll({ where: { Profile_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving profiles: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Profiles.findOne({
                where: { Profile_ID: id, Profile_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving profile: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del perfil no exista
            const existingProfile = await Profiles.findOne({
                where: { Profile_Name: data.Profile_Name, Profile_Status: true }
            });
            if (existingProfile) {
                throw new Error(`Profile with name "${data.Profile_Name}" already exists.`);
            }
            // Crear el nuevo perfil
            data.Profile_Status = true; // Aseguramos que el perfil esté activo al crearlo
            data.Profile_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Profiles.create(data);
            
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
                "Profiles",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Profiles con ID ${newRecord.Profile_ID} - Nombre: ${newRecord.Profile_Name}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating profile: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Profiles.bulkCreate(data);
            
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
                "Profiles",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros Profiles.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Profiles: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const profileRecord = await this.getById(id);
            if (!profileRecord) return null;

            const [rowsUpdated] = await Profiles.update(data, {
                where: { Profile_ID: id, Profile_Status: true }
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

            // Describir cambios
            let changeDetails = [];
            if (data.hasOwnProperty('Profile_Name') && data.Profile_Name !== originalValues.Profile_Name) {
                changeDetails.push(`Nombre: "${originalValues.Profile_Name}" → "${data.Profile_Name}"`);
            }
            if (data.hasOwnProperty('Profile_Status') && data.Profile_Status !== originalValues.Profile_Status) {
                changeDetails.push(`Estado: "${originalValues.Profile_Status}" → "${data.Profile_Status}"`);
            }
            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Profiles",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Profiles con ID ${id} - Nombre: ${profileRecord.Profile_Name}${changeDescription}`
            );

            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const profileRecord = await this.getById(id);
            if (!profileRecord) return null;

            await Profiles.update(
                { Profile_Status: false },
                { where: { Profile_ID: id, Profile_Status: true } }
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
                "Profiles",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Profiles con ID ${id} - Nombre: ${profileRecord.Profile_Name}`
            );
            return profileRecord;
        } catch (error) {
            throw new Error(`Error deleting profile: ${error.message}`);
        }
    }
}


