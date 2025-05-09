import { Type_Of_Activity } from "../../schemas/parameter_tables/Type_Of_Activity.js";

export class TypeOfActivityModel {
    
    static async getAll() {
        try {
            return await Type_Of_Activity.findAll({ where: { Type_Of_Activity_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Activity.findOne({
                where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Type_Of_Activity.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Type_Of_Activity.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const typeOfActivityRecord = await this.getById(id);
            if (!typeOfActivityRecord) return null;

            const [rowsUpdated] = await Type_Of_Activity.update(data, {
                where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const typeOfActivityRecord = await this.getById(id);
            if (!typeOfActivityRecord) return null;

            await Type_Of_Activity.update(
                { Type_Of_Activity_Status: false },
                { where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true } }
            );
            return typeOfActivityRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
