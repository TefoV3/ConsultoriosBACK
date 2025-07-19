import { Own_Assets } from "../../schemas/parameter_tables/Own_Assets.js";
import { AuditModel } from "../../models/AuditModel.js";

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
                where: { Own_Assets_ID: id, Own_Assets_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del activo no exista
            const existingOwnAsset = await Own_Assets.findOne({
                where: { Own_Assets_Name: data.Own_Assets_Name, Own_Assets_Status: true }
            });
            if (existingOwnAsset) {
                throw new Error(`Own Asset with name "${data.Own_Assets_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Own_Assets_Status = true; // Aseguramos que el activo esté activo al crearlo
            data.Own_Assets_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Own_Assets.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Own_Assets",
                            `El usuario interno ${internalId} creó un nuevo registro Own_Assets con ID ${newRecord.Own_Assets_ID}`
                        );
            
                        return newRecord;

        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Own_Assets.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Own_Assets",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Own_Assets.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Own Assets: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            const [rowsUpdated] = await Own_Assets.update(data, {
                where: { Own_Assets_ID: id, Own_Assets_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Own_Assets",
                `El usuario interno ${internalId} actualizó Own_Assets con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Own_AssetsRecord = await this.getById(id);
            if (!Own_AssetsRecord) return null;

            await Own_Assets.update(
                { Own_Assets_Status: false },
                { where: { Own_Assets_ID: id, Own_Assets_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Own_Assets",
                `El usuario interno ${internalId} eliminó lógicamente Own_Assets con ID ${id}`
            );
            return Own_AssetsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
