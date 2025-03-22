import { Income_Level } from "../../schemas/parameter_tables/Income_Level.js";

export class IncomeLevelModel {
    
    static async getAll() {
        try {
            return await Income_Level.findAll({ where: { Income_Level_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Income_Level.findOne({
                where: { Income_Level_Id: id, Income_Level_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Income_Level.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            const [rowsUpdated] = await Income_Level.update(data, {
                where: { Income_Level_Id: id, Income_Level_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            await Income_Level.update(
                { Income_Level_Status: false },
                { where: { Income_Level_Id: id, Income_Level_Status: true } }
            );
            return Income_LevelRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
