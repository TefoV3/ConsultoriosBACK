import { Income_Level } from "../../schemas/parameter_tables/Income_Level.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class IncomeLevelModel {
    
    static async getAll() {
        try {
            return await Income_Level.findAll({ where: { Income_Level_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Income_Level.findOne({
                where: { Income_Level_ID: id, Income_Level_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del nivel de ingreso no exista
            const existingIncomeLevel = await Income_Level.findOne({
                where: { Income_Level_Name: data.Income_Level_Name, Income_Level_Status: true }
            });
            if (existingIncomeLevel) {
                throw new Error(`Income Level with name "${data.Income_Level_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Income_Level_Status = true; // Aseguramos que el nivel de ingreso esté activo al crearlo
            data.Income_Level_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Income_Level.create(data);
           
            // Auditoría detallada
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Income_Level",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de nivel de ingreso con ID ${newRecord.Income_Level_ID} - Nombre: ${newRecord.Income_Level_Name}`
            );
           
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Academic_Instruction.bulkCreate(data);
            
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Income_Level",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de nivel de ingreso.`
            );

            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Income_Level: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            const [rowsUpdated] = await Income_Level.update(data, {
                where: { Income_Level_ID: id, Income_Level_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Income_Level",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el nivel de ingreso con ID ${id} - Nombre: ${Income_LevelRecord.Income_Level_Name}`
            );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            await Income_Level.update(
                { Income_Level_Status: false },
                { where: { Income_Level_ID: id, Income_Level_Status: true } }
            );

            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Income_Level",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el nivel de ingreso con ID ${id} - Nombre: ${Income_LevelRecord.Income_Level_Name}`
            );
            return Income_LevelRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
