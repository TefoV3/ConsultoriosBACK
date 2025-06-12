import { Profiles } from "../../schemas/parameter_tables/Profiles.js";
import { AuditModel } from "../../models/AuditModel.js";
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
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Profiles",
                            `El usuario interno ${internalId} creó un nuevo registro Profiles con ID ${newRecord.Profile_ID}`
                        );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating profile: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Profiles.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Profiles",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros Profiles.`
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
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Profiles",
                            `El usuario interno ${internalId} actualizó Profiles con ID ${id}`
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

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Profiles",
                            `El usuario interno ${internalId} eliminó lógicamente Profiles con ID ${id}`
                        );
            return profileRecord;
        } catch (error) {
            throw new Error(`Error deleting profile: ${error.message}`);
        }
    }
}


