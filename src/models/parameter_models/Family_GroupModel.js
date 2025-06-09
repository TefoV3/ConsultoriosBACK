import { Family_Group } from "../../schemas/parameter_tables/Family_Group.js";

export class FamilyGroupModel {
    
    static async getAll() {
        try {
            return await Family_Group.findAll({ where: { Family_Group_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Group.findOne({
                where: { Family_Group_ID: id, Family_Group_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Family_Group.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Family_Group.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Family Group: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            const [rowsUpdated] = await Family_Group.update(data, {
                where: { Family_Group_ID: id, Family_Group_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            await Family_Group.update(
                { Family_Group_Status: false },
                { where: { Family_Group_ID: id, Family_Group_Status: true } }
            );
            return Family_GroupRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
