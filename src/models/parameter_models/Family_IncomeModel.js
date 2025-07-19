import { Family_Income } from "../../schemas/parameter_tables/Family_Income.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class FamilyIncomeModel {
    
    static async getAll() {
        try {
            return await Family_Income.findAll({ where: { Family_Income_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Income.findOne({
                where: { Family_Income_ID: id, Family_Income_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del ingreso familiar no exista
            const existingFamilyIncome = await Family_Income.findOne({
                where: { Family_Income_Name: data.Family_Income_Name, Family_Income_Status: true }
            });
            if (existingFamilyIncome) {
                throw new Error(`Family Income with name "${data.Family_Income_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Family_Income_Status = true; // Aseguramos que el ingreso familiar esté activo al crearlo
            data.Family_Income_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Family_Income.create(data);
            
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
                "Family_Income",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de ingreso familiar con ID ${newRecord.Family_Income_ID} - Nombre: ${newRecord.Family_Income_Name}`
            );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Family_Income.bulkCreate(data);
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
                "Family_Income",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de ingreso familiar.`
            );
            
            return createdRecords; // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Family Income: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            const [rowsUpdated] = await Family_Income.update(data, {
                where: { Family_Income_ID: id, Family_Income_Status: true }
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
                "Family_Income",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el ingreso familiar con ID ${id} - Nombre: ${Family_IncomeRecord.Family_Income_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            await Family_Income.update(
                { Family_Income_Status: false },
                { where: { Family_Income_ID: id, Family_Income_Status: true } }
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
                "Family_Income",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el ingreso familiar con ID ${id} - Nombre: ${Family_IncomeRecord.Family_Income_Name}`
            );
            return Family_IncomeRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
