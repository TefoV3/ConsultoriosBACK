import { Disability } from "../../schemas/parameter_tables/Disability.js";

export class DisabilityModel {

    static async getAll() {
        try {
            return await Disability.findAll({ where: { Disability_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Disability.findOne({
                where: { Disability_Id: id, Disability_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving disability: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Disability.create(data);
        } catch (error) {
            throw new Error(`Error creating disability: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            const [rowsUpdated] = await Disability.update(data, {
                where: { Disability_Id: id, Disability_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating disability: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            await Disability.update(
                { Disability_Status: false },
                { where: { Disability_Id: id, Disability_Status: true } }
            );
            return disabilityRecord;
        } catch (error) {
            throw new Error(`Error deleting disability: ${error.message}`);
        }
    }

}