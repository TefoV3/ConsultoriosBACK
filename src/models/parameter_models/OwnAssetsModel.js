import { Own_Assets } from "../../schemas/parameter_tables/Own_Assets.js";

export class OwnAssetsModel {
    
    static async getAll() {
        try {
            return await Own_Assets.findAll({ where: { Own_Assets_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Own_Assets.findOne({
                where: { Own_Assets_Id: id, Own_Assets_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Own_Assets.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            const [rowsUpdated] = await Own_Assets.update(data, {
                where: { Own_Assets_Id: id, Own_Assets_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            await Own_Assets.update(
                { Own_Assets_Status: false },
                { where: { Own_Assets_Id: id, Own_Assets_Status: true } }
            );
            return Own_AssetsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
