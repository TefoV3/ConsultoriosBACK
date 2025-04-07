import { Type_Of_Attention } from "../../schemas/parameter_tables/Type_Of_Attention.js";

export class TypeOfAttentionModel {

    static async getAll() {
        try {
            return await Type_Of_Attention.findAll({ where: { Type_Of_Attention_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving type of attentions: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Attention.findOne({
                where: { Type_Of_Attention_Id: id, Type_Of_Attention_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving type of attention: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Type_Of_Attention.create(data);
        } catch (error) {
            throw new Error(`Error creating type of attention: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Type_Of_Attention.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Type Of Attention: ${error.message}`);
        }
    }   
    static async update(id, data) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            const [rowsUpdated] = await Type_Of_Attention.update(data, {
                where: { Type_Of_Attention_Id: id, Type_Of_Attention_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating type of attention: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            await Type_Of_Attention.update(
                { Type_Of_Attention_Status: false },
                { where: { Type_Of_Attention_Id: id, Type_Of_Attention_Status: true } }
            );
            return typeOfAttentionRecord;
        } catch (error) {
            throw new Error(`Error deleting type of attention: ${error.message}`);
        }
    }
}