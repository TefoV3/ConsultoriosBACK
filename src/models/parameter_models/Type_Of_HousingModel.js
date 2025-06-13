import { Type_Of_Housing } from "../../schemas/parameter_tables/Type_Of_Housing.js";
import { AuditModel } from "../../models/AuditModel.js";

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

    static async create(data, internalId) {
        try {
            // Validar que el nombre no exista
            const existingRecord = await Type_Of_Housing.findOne({
                where: {
                    Type_Of_Housing_Name: data.Type_Of_Housing_Name,
                    Type_Of_Housing_Status: true
                }
            });
            if (existingRecord) {
                throw new Error(`Ya existe un registro de Type_Of_Housing con el nombre ${data.Type_Of_Housing_Name}`);
            }
            const newRecord = await Type_Of_Housing.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Academic_Instruction",
                            `El usuario interno ${internalId} creó un nuevo registro de instrucción académica con ID ${newRecord.Type_Of_Housing_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Type_Of_Housing.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Type_Of_Housing",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Type_Of_Housing.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Type Of Housing: ${error.message}`);
        }
    }  
    static async update(id, data, internalId) {
        try {
            const Type_Of_HousingRecord = await this.getById(id);
            if (!Type_Of_HousingRecord) return null;

            const [rowsUpdated] = await Type_Of_Housing.update(data, {
                where: { Type_Of_Housing_ID: id, Type_Of_Housing_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Type_Of_Housing",
                `El usuario interno ${internalId} actualizó la Type_Of_Housing con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Type_Of_HousingRecord = await this.getById(id);
            if (!Type_Of_HousingRecord) return null;

            await Type_Of_Housing.update(
                { Type_Of_Housing_Status: false },
                { where: { Type_Of_Housing_ID: id, Type_Of_Housing_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Type_Of_Housing",
                `El usuario interno ${internalId} eliminó lógicamente Type_Of_Housing con ID ${id}`
            );
            return Type_Of_HousingRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
