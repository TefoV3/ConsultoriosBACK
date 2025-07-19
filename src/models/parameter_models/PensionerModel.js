import { Pensioner } from "../../schemas/parameter_tables/Pensioner.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class PensionerModel {

    static async getAll() {
        try {
            return await Pensioner.findAll({ where: { Pensioner_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Pensioner.findOne({
                where: { Pensioner_ID: id, Pensioner_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving Pensioner: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del pensionado no exista
            const existingPensioner = await Pensioner.findOne({
                where: { Pensioner_Name: data.Pensioner_Name, Pensioner_Status: true }
            });
            if (existingPensioner) {
                throw new Error(`Pensioner with name "${data.Pensioner_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Pensioner_Status = true; // Aseguramos que el pensionado esté activo al crearlo    
            data.Pensioner_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Pensioner.create(data);
            
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
                "Pensioner",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de pensionado con ID ${newRecord.Pensioner_ID} - Nombre: ${newRecord.Pensioner_Name}`
            );
            
                return newRecord;
        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Pensioner.bulkCreate(data);
            
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
                "Pensioner",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de pensionado.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            const [rowsUpdated] = await Pensioner.update(data, {
                where: { Pensioner_ID: id, Pensioner_Status: true }
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
                "Pensioner",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el pensionado con ID ${id} - Nombre: ${PensionerRecord.Pensioner_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating Pensioner: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            await Pensioner.update(
                { Pensioner_Status: false },
                { where: { Pensioner_ID: id, Pensioner_Status: true } }
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
                "Pensioner",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el pensionado con ID ${id} - Nombre: ${PensionerRecord.Pensioner_Name}`
            );

            return PensionerRecord;
        } catch (error) {
            throw new Error(`Error deleting Pensioner: ${error.message}`);
        }
    }

}