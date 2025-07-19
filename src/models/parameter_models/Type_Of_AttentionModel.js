import { Type_Of_Attention } from "../../schemas/parameter_tables/Type_Of_Attention.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class TypeOfAttentionModel {

    static async getAll() {
        try {
            return await Type_Of_Attention.findAll({ where: { Type_Of_Attention_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving type of attentions: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Attention.findOne({
                where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving type of attention: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre no exista
            const existingRecord = await Type_Of_Attention.findOne({
                where: {
                    Type_Of_Attention_Name: data.Type_Of_Attention_Name,
                    Type_Of_Attention_Status: true
                }   
            });
            if (existingRecord) {
                throw new Error(`Ya existe un registro de Type_Of_Attention con el nombre ${data.Type_Of_Attention_Name}`);
            }
            const newRecord = await Type_Of_Attention.create(data);
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
                "Type_Of_Attention",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Type_Of_Attention con ID ${newRecord.Type_Of_Attention_ID} - Nombre: ${newRecord.Type_Of_Attention_Name}`
            );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating type of attention: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Type_Of_Attention.bulkCreate(data);
            
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
                "Type_Of_Attention",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Type_Of_Attention.`
            );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Type Of Attention: ${error.message}`);
        }
    }   
    static async update(id, data, internalId) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            const [rowsUpdated] = await Type_Of_Attention.update(data, {
                where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true }
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

            // Describir cambios
            let changeDetails = [];
            if (data.hasOwnProperty('Type_Of_Attention_Name') && data.Type_Of_Attention_Name !== originalValues.Type_Of_Attention_Name) {
                changeDetails.push(`Nombre: "${originalValues.Type_Of_Attention_Name}" → "${data.Type_Of_Attention_Name}"`);
            }
            if (data.hasOwnProperty('Type_Of_Attention_Status') && data.Type_Of_Attention_Status !== originalValues.Type_Of_Attention_Status) {
                changeDetails.push(`Estado: "${originalValues.Type_Of_Attention_Status}" → "${data.Type_Of_Attention_Status}"`);
            }
            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Type_Of_Attention",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Type_Of_Attention con ID ${id} - Nombre: ${typeOfAttentionRecord.Type_Of_Attention_Name}${changeDescription}`
            );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating type of attention: ${error.message}`);
        }
    }

    static async delete(id,internalId) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            await Type_Of_Attention.update(
                { Type_Of_Attention_Status: false },
                { where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true } }
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
                "Type_Of_Attention",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Type_Of_Attention con ID ${id} - Nombre: ${typeOfAttentionRecord.Type_Of_Attention_Name}`
            );
            return typeOfAttentionRecord;
        } catch (error) {
            throw new Error(`Error deleting type of attention: ${error.message}`);
        }
    }
}