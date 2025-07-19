import { Sex } from "../../schemas/parameter_tables/Sex.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class SexModel {

    static async getAll() {
        try {
            return await Sex.findAll({
                where: { Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sexes: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Sex.findOne({
                where: { Sex_ID: id, Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sex: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del sexo no exista
            const existingSex = await Sex.findOne({
                where: { Sex_Name: data.Sex_Name, Sex_Status: true }
            });

            if (existingSex) {
                throw new Error(`Sex with name "${data.Sex_Name}" already exists.`);
            }


            const newRecord = await Sex.create(data);
            
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
                "Sex",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Sex con ID ${newRecord.Sex_ID} - Nombre: ${newRecord.Sex_Name}`
            );
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating sex: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Sex.bulkCreate(data);
            
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
                "Sex",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Sex.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Sex: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            const [rowsUpdated] = await Sex.update(data, {
                where: { Sex_ID: id, Sex_Status: true }
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
                "Sex",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Sex con ID ${id} - Nombre: ${sexRecord.Sex_Name}`
            );

            
            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating sex: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            await Sex.update(
                { Sex_Status: false },
                { where: { Sex_ID: id, Sex_Status: true } }
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
                "Sex",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Sex con ID ${id} - Nombre: ${sexRecord.Sex_Name}`
            );
            return sexRecord;
        } catch (error) {
            throw new Error(`Error deleting sex: ${error.message}`);
        }
    }
}
