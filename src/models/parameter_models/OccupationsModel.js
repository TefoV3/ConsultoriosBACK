import { Occupations } from "../../schemas/parameter_tables/Occupations.js";

export class OccupationsModel {
    
    static async getAll() {
        try {
            return await Occupations.findAll({ where: { Occupation_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Occupations.findOne({
                where: { Occupations_Id: id, Occupations_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Occupations.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            const [rowsUpdated] = await Occupations.update(data, {
                where: { Occupation_Id: id, Occupation_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            await Occupations.update(
                { Occupation_Status: false },
                { where: { Occupation_Id: id, Occupation_Status: true } }
            );
            return OccupationsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
