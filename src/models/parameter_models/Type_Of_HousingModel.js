import { Type_Of_Housing } from "../../schemas/parameter_tables/Type_Of_Housing.js";

export class TypeOfHousingModel {
    
    static async getAll() {
        try {
            return await Type_Of_Housing.findAll({ where: { Type_Of_Housing_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Housing.findOne({
                where: { Type_Of_Housing_ID: id, Type_Of_Housing_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Type_Of_Housing.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Type_Of_Housing.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Type Of Housing: ${error.message}`);
        }
    }  
    static async update(id, data) {
        try {
            const Type_Of_HousingRecord = await this.getById(id);
            if (!Type_Of_HousingRecord) return null;

            const [rowsUpdated] = await Type_Of_Housing.update(data, {
                where: { Type_Of_Housing_ID: id, Type_Of_Housing_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const Type_Of_HousingRecord = await this.getById(id);
            if (!Type_Of_HousingRecord) return null;

            await Type_Of_Housing.update(
                { Type_Of_Housing_Status: false },
                { where: { Type_Of_Housing_ID: id, Type_Of_Housing_Status: true } }
            );
            return Type_Of_HousingRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
