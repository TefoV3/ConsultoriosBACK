import { Documentation_Backup } from "../../schemas/parameter_tables/Documentation_Backup.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class DocumentationBackupModel {

    static async getAll() {
        try {
            return await Documentation_Backup.findAll({
                where: { Documentation_Backup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Documentation_Backup.findOne({
                where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del backup no exista
            const existingBackup = await Documentation_Backup.findOne({
                where: { Documentation_Backup_Name: data.Documentation_Backup_Name, Documentation_Backup_Status: true }
            });
            if (existingBackup) {
                throw new Error(`Documentation Backup with name "${data.Documentation_Backup_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Documentation_Backup_Status = true; // Aseguramos que el backup esté activo al crearlo
            data.Documentation_Backup_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Documentation_Backup.create(data);
            
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
                "Documentation_Backup",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de documentos de respaldo con ID ${newRecord.Documentation_Backup_ID} - Nombre: ${newRecord.Documentation_Backup_Name}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating documentation backup: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Documentation_Backup.bulkCreate(data);
            
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
                "Documentation_Backup",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de documentos de respaldo.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Documentation Backup: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            const [rowsUpdated] = await Documentation_Backup.update(data, {
                where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true }
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
                "Documentation_Backup",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el documento de respaldo con ID ${id} - Nombre: ${documentationBackupRecord.Documentation_Backup_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating documentation backup: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            await Documentation_Backup.update(
                { Documentation_Backup_Status: false },
                { where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true } }
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
                "Documentation_Backup",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el documento de respaldo con ID ${id} - Nombre: ${documentationBackupRecord.Documentation_Backup_Name}`
            );
            return documentationBackupRecord;
        } catch (error) {
            throw new Error(`Error deleting documentation backup: ${error.message}`);
        }
    }
}
