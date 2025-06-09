import { Vulnerable_Situation } from "../../schemas/parameter_tables/Vulnerable_Situation.js";

export class VulnerableSituationModel {

    static async getAll() {
        try {
            return await Vulnerable_Situation.findAll({ where: { Vulnerable_Situation_Status: true } });
        }
        catch (error) {
            throw new Error(`Error retrieving vulnerable situations: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Vulnerable_Situation.findOne({
                where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving vulnerable situation: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Vulnerable_Situation.create(data);
        } catch (error) {
            throw new Error(`Error creating vulnerable situation: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Vulnerable_Situation.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Vulnerable Situation: ${error.message}`);
        }
    } 
    static async update(id, data) {
        try {
            const vulnerableSituationRecord = await this.getById(id);
            if (!vulnerableSituationRecord) return null;

            const [rowsUpdated] = await Vulnerable_Situation.update(data, {
                where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating vulnerable situation: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const vulnerableSituationRecord = await this.getById(id);
            if (!vulnerableSituationRecord) return null;

            await Vulnerable_Situation.update(
                { Vulnerable_Situation_Status: false },
                { where: { Vulnerable_Situation_ID: id, Vulnerable_Situation_Status: true } }
            );
            return vulnerableSituationRecord;
        } catch (error) {
            throw new Error(`Error deleting vulnerable situation: ${error.message}`);
        }
    }

}









