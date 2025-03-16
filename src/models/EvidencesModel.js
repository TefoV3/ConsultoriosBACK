import { Evidence } from "../schemas/Evidences.js";

export class EvidenceModel {

    static async getAll() {
        try {
            return await Evidence.findAll();
        } catch (error) {
            throw new Error(`Error retrieving evidence: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Evidence.findOne({
                where: { Evidence_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving evidence: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Evidence.create(data);
        } catch (error) {
            throw new Error(`Error creating evidence: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const evidence = await this.getById(id);
            if (!evidence) return null;

            const [rowsUpdated] = await Evidence.update(data, {
                where: { Evidence_ID: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating evidence: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const evidence = await this.getById(id);
            if (!evidence) return null;

            await Evidence.destroy({ where: { Evidence_ID: id } });
            return evidence;
        } catch (error) {
            throw new Error(`Error deleting evidence: ${error.message}`);
        }
    }
}