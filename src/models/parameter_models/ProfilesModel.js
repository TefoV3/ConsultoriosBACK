import { Profiles } from "../../schemas/parameter_tables/Profiles.js";

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
                where: { Profile_Id: id, Profile_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving profile: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Profiles.create(data);
        } catch (error) {
            throw new Error(`Error creating profile: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const profileRecord = await this.getById(id);
            if (!profileRecord) return null;

            const [rowsUpdated] = await Profiles.update(data, {
                where: { Profile_Id: id, Profile_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const profileRecord = await this.getById(id);
            if (!profileRecord) return null;

            await Profiles.update(
                { Profile_Status: false },
                { where: { Profile_Id: id, Profile_Status: true } }
            );
            return profileRecord;
        } catch (error) {
            throw new Error(`Error deleting profile: ${error.message}`);
        }
    }
}


