import { Derived_By } from "../../schemas/parameter_tables/Derived_By.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class DerivedByModel {

    static async getAll() {
        try {
            return await Derived_By.findAll({
                where: { Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by records: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Derived_By.findOne({
                where: { Derived_By_ID: id, Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by record: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del derivado no exista
            const existingDerivedBy = await Derived_By.findOne({
                where: { Derived_By_Name: data.Derived_By_Name, Derived_By_Status: true }
            });
            if (existingDerivedBy) {
                throw new Error(`Derived By with name "${data.Derived_By_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Derived_By_Status = true; // Aseguramos que el derivado esté activo al crearlo
            data.Derived_By_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Derived_By.create(data);
            
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
                "Derived_By",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Derived_By con ID ${newRecord.Derived_By_ID} - Nombre: ${newRecord.Derived_By_Name}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating derived by record: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Derived_By.bulkCreate(data);
            
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
                "Derived_By",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Derived_By.`
            );
            
            return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Derived By: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            const [rowsUpdated] = await Derived_By.update(data, {
                where: { Derived_By_ID: id, Derived_By_Status: true }
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
                "Derived_By",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el registro Derived_By con ID ${id} - Nombre: ${derivedByRecord.Derived_By_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating derived by record: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            await Derived_By.update(
                { Derived_By_Status: false },
                { where: { Derived_By_ID: id, Derived_By_Status: true } }
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
                "Derived_By",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el registro Derived_By con ID ${id} - Nombre: ${derivedByRecord.Derived_By_Name}`
            );

            return derivedByRecord;
        } catch (error) {
            throw new Error(`Error deleting derived by record: ${error.message}`);
        }
    }
}
