import { Family_Income } from "../../schemas/parameter_tables/Family_Income.js";

export class FamilyIncomeModel {
    
    static async getAll() {
        try {
            return await Family_Income.findAll({ where: { Family_Income_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Income.findOne({
                where: { Family_Income_Id: id, Family_Income_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Family_Income.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Family_Income.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Family Income: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            const [rowsUpdated] = await Family_Income.update(data, {
                where: { Family_Income_Id: id, Family_Income_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            await Family_Income.update(
                { Family_Income_Status: false },
                { where: { Family_Income_Id: id, Family_Income_Status: true } }
            );
            return Family_IncomeRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
