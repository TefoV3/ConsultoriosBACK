import { Catastrophic_Illness } from "../../schemas/parameter_tables/Catastrophic_Illness.js";
import { AuditModel } from "../../models/AuditModel.js";

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
        
            static async create(data, internalId) {
                try {
                    // Validar que el nombre de la enfermedad catastrófica no exista
                    const existingIllness = await Catastrophic_Illness.findOne({
                        where: { Catastrophic_Illness_Name: data.Catastrophic_Illness_Name, Catastrophic_Illness_Status: true }
                    });
                    if (existingIllness) {
                        throw new Error(`Catastrophic illness with name "${data.Catastrophic_Illness_Name}" already exists.`);
                    }
                    // Aseguramos que el estado esté activo al crear
                    data.Catastrophic_Illness_Status = true; // Aseguramos que la enfermedad catastrófica esté activa al crearlo
                    data.Catastrophic_Illness_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental


                    const newRecord = await Catastrophic_Illness.create(data);
                    await AuditModel.registerAudit(
                        internalId,
                        "INSERT",
                        "Catastrophic_Illness",
                        `El usuario interno ${internalId} creó un nuevo registro de enfermedad catastrófica con ID ${newRecord.Catastrophic_Illness_ID}`
                    );
                        return newRecord
                } catch (error) {
                    throw new Error(`Error creating catastrophic illness: ${error.message}`);
                }
            }
            static async bulkCreate(data, internalId) {
                try {
                    const createdRecords = await Catastrophic_Illness.bulkCreate(data);
                    
                            await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Catastrophic_Illness",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de enfermedad catastrófica.`
                        );
                    
                    return createdRecords;
                } catch (error) {
                    throw new Error(`Error creating Catastrophic Illness: ${error.message}`);
                }
            }
            static async update(id, data, internalId) {
                try {
                    const catastrophicIllnessRecord = await this.getById(id);
                    if (!catastrophicIllnessRecord) return null;
        
                    const [rowsUpdated] = await Catastrophic_Illness.update(data, {
                        where: { Catastrophic_Illness_ID: id, Catastrophic_Illness_Status: true }
                    });
        
                    if (rowsUpdated === 0) return null;
                    await AuditModel.registerAudit(
                        internalId,
                        "UPDATE",
                        "Catastrophic_Illness",
                        `El usuario interno ${internalId} actualizó la enfermedad catastrófica con ID ${id}`
                    );

                    return await this.getById(id);
                } catch (error) {
                    throw new Error(`Error updating catastrophic illness: ${error.message}`);
                }
            }
        
            static async delete(id, internalId) {
                try {
                    const catastrophicIllnessRecord = await this.getById(id);
                    if (!catastrophicIllnessRecord) return null;
        
                    await Catastrophic_Illness.update(
                        { Catastrophic_Illness_Status: false },
                        { where: { Catastrophic_Illness_ID: id, Catastrophic_Illness_Status: true } }
                    );
                    await AuditModel.registerAudit(
                        internalId,
                        "DELETE",
                        "Catastrophic_Illness",
                        `El usuario interno ${internalId} eliminó lógicamente la enfermedad catastrófica con ID ${id}`
                    );
                    return catastrophicIllnessRecord;
                } catch (error) {
                    throw new Error(`Error deleting catastrophic illness: ${error.message}`);
                }
            }
    }