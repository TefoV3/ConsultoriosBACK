import { Ethnicity } from "../../schemas/parameter_tables/Ethnicity.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class EthnicityModel {

    static async getAll() {
        try {
            return await Ethnicity.findAll({
                where: { Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Ethnicity.findOne({
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicity: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la etnia no exista
            const existingEthnicity = await Ethnicity.findOne({
                where: { Ethnicity_Name: data.Ethnicity_Name, Ethnicity_Status: true }
            });
            if (existingEthnicity) {
                throw new Error(`Ethnicity with name "${data.Ethnicity_Name}" already exists.`);
            }



            const newRecord = await Ethnicity.create(data);
            
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
                "Ethnicity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de etnia con ID ${newRecord.Ethnicity_ID} - Nombre: ${newRecord.Ethnicity_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating ethnicity: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Ethnicity.bulkCreate(data);
            
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
                "Ethnicity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de etnia.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating ethnicities: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            const [rowsUpdated] = await Ethnicity.update(data, {
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
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
                "Ethnicity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la etnia con ID ${id} - Nombre: ${ethnicityRecord.Ethnicity_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating ethnicity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            await Ethnicity.update(
                { Ethnicity_Status: false },
                { where: { Ethnicity_ID: id, Ethnicity_Status: true } }
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
                "Ethnicity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la etnia con ID ${id} - Nombre: ${ethnicityRecord.Ethnicity_Name}`
            );

            return ethnicityRecord;
        } catch (error) {
            throw new Error(`Error deleting ethnicity: ${error.message}`);
        }
    }
}
