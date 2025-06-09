import { Catastrophic_Illness } from "../../schemas/parameter_tables/Catastrophic_Illness.js";

export class CatastrophicIllnessModel {
        
            static async getAll() {
                try {
                    return await Catastrophic_Illness.findAll({ where: { Catastrophic_Illness_Status: true } });
                } catch (error) {
                    throw new Error(`Error retrieving catastrophic illnesses: ${error.message}`);
                }
            }
        
            static async getById(id) {
                try {
                    return await Catastrophic_Illness.findOne({
                        where: { Catastrophic_Illness_ID: id, Catastrophic_Illness_Status: true }
                    });
                } catch (error) {
                    throw new Error(`Error retrieving catastrophic illness: ${error.message}`);
                }
            }
        
            static async create(data) {
                try {
                    return await Catastrophic_Illness.create(data);
                } catch (error) {
                    throw new Error(`Error creating catastrophic illness: ${error.message}`);
                }
            }
            static async bulkCreate(data) {
                try {
                    return await Catastrophic_Illness.bulkCreate(data); // Usa el bulkCreate de Sequelize
                } catch (error) {
                    throw new Error(`Error creating Catastrophic Illness: ${error.message}`);
                }
            }
            static async update(id, data) {
                try {
                    const catastrophicIllnessRecord = await this.getById(id);
                    if (!catastrophicIllnessRecord) return null;
        
                    const [rowsUpdated] = await Catastrophic_Illness.update(data, {
                        where: { Catastrophic_Illness_ID: id, Catastrophic_Illness_Status: true }
                    });
        
                    if (rowsUpdated === 0) return null;
                    return await this.getById(id);
                } catch (error) {
                    throw new Error(`Error updating catastrophic illness: ${error.message}`);
                }
            }
        
            static async delete(id) {
                try {
                    const catastrophicIllnessRecord = await this.getById(id);
                    if (!catastrophicIllnessRecord) return null;
        
                    await Catastrophic_Illness.update(
                        { Catastrophic_Illness_Status: false },
                        { where: { Catastrophic_Illness_ID: id, Catastrophic_Illness_Status: true } }
                    );
                    return catastrophicIllnessRecord;
                } catch (error) {
                    throw new Error(`Error deleting catastrophic illness: ${error.message}`);
                }
            }
    }