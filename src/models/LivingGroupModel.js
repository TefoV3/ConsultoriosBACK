import { LivingGroup } from "../schemas/LivingGroup.js";

export class LivingGroupModel {
    static async getById(id) {
        try {
            return await LivingGroup.findOne({
                where: { LivingGroup_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving living group: ${error.message}`);
        }
    }

    static async getByProcessNumber(processNumber) {
        try {
            return await LivingGroup.findAll({
                where: { ProcessNumber: processNumber, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving living groups by process number: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await LivingGroup.create(data);
        } catch (error) {
            throw new Error(`Error creating living group: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const livingGroupRecord = await this.getById(id);
            if (!livingGroupRecord) return null;

            const [rowsUpdated] = await LivingGroup.update(data, {
                where: { LivingGroup_ID: id, Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating living group: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const livingGroupRecord = await this.getById(id);
            if (!livingGroupRecord) return null;

            await LivingGroup.update(
                { Status: false },
                { where: { LivingGroup_ID: id, Status: true } }
            );
            return livingGroupRecord;
        } catch (error) {
            throw new Error(`Error deleting living group: ${error.message}`);
        }
    }
}
