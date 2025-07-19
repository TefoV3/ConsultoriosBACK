import { Health_Insurance } from "../../schemas/parameter_tables/Health_Insurance.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class HealthInsuranceModel {
    
    static async getAll() {
        try {
            return await Health_Insurance.findAll({ where: { Health_Insurance_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Health_Insurance.findOne({
                where: { Health_Insurance_ID: id, Health_Insurance_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del seguro de salud no exista
            const existingHealthInsurance = await Health_Insurance.findOne({
                where: { Health_Insurance_Name: data.Health_Insurance_Name, Health_Insurance_Status: true }
            });
            if (existingHealthInsurance) {
                throw new Error(`Health Insurance with name "${data.Health_Insurance_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Health_Insurance_Status = true; // Aseguramos que el seguro de salud esté activo al crearlo
            data.Health_Insurance_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Health_Insurance.create(data);
            
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
                "Health_Insurance",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de seguro de salud con ID ${newRecord.Health_Insurance_ID} - Nombre: ${newRecord.Health_Insurance_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
             const createdRecords = await Health_Insurance.bulkCreate(data);
            
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
                "Health_Insurance",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de seguro de salud.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Health Insurance: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const healthInsuranceRecord = await this.getById(id);
            if (!healthInsuranceRecord) return null;

            const [rowsUpdated] = await Health_Insurance.update(data, {
                where: { Health_Insurance_ID: id, Health_Insurance_Status: true }
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
                "Health_Insurance",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el seguro de salud con ID ${id} - Nombre: ${healthInsuranceRecord.Health_Insurance_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const healthInsuranceRecord = await this.getById(id);
            if (!healthInsuranceRecord) return null;

            await Health_Insurance.update(
                { Health_Insurance_Status: false },
                { where: { Health_Insurance_ID: id, Health_Insurance_Status: true } }
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
                "Health_Insurance",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el seguro de salud con ID ${id} - Nombre: ${healthInsuranceRecord.Health_Insurance_Name}`
            );

            return healthInsuranceRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
