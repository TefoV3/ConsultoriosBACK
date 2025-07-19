import { Field_Of_Activity } from "../../schemas/parameter_tables/Field_Of_Activity.js";
// Corregido: Importar Type_Of_Activity en lugar de Subject
import { Type_Of_Activity } from "../../schemas/parameter_tables/Type_Of_Activity.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class Field_Of_Activity_Model {

    static async getAll() {
        try {
            return await Field_Of_Activity.findAll({
                where: { Field_Of_Activity_Status: true },
                include: {
                    model: Type_Of_Activity, // Usar el modelo importado correctamente
                    as: 'type_of_activity', // Alias definido en el schema (asegúrate que coincida)
                    attributes: ['Type_Of_Activity_Name'] // Atributos a incluir
                }
            });
        } catch (error) {
            // Considera usar un nombre más descriptivo en el mensaje si es posible
            throw new Error(`Error retrieving Fields Of Activity: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Field_Of_Activity.findOne({
                where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true },
                include: {
                    model: Type_Of_Activity, // Usar el modelo importado correctamente
                    as: 'type_of_activity', // Alias definido en el schema
                    attributes: ['Type_Of_Activity_Name'] // Atributos a incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving Field Of Activity: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del campo de actividad no exista
            const existingFieldOfActivity = await Field_Of_Activity.findOne({
                where: { Field_Of_Activity_Name: data.Field_Of_Activity_Name, Field_Of_Activity_Status: true }
            });
            if (existingFieldOfActivity) {
                throw new Error(`Field Of Activity with name "${data.Field_Of_Activity_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Field_Of_Activity_Status = true; // Aseguramos que el campo de actividad esté activo al crearlo
            data.Field_Of_Activity_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Field_Of_Activity.create(data);
            
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
                "Field_Of_Activity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de campo de actividad con ID ${newRecord.Field_Of_Activity_ID} - Nombre: ${newRecord.Field_Of_Activity_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating Field Of Activity: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Field_Of_Activity.bulkCreate(data);
            
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
                "Field_Of_Activity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de campo de actividad.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error bulk creating Fields Of Activity: ${error.message}`);
        }
    }

    // Corregido: Renombrado y ajustado para Type_Of_Activity
    static async getByTypeOfActivityId(typeOfActivityId) {
        try {
            // Asegúrate que 'Type_Of_Activity_FK' sea el nombre correcto de la clave foránea en tu schema Field_Of_Activity_
            return await Field_Of_Activity.findAll({
                where: { Type_Of_Activity_FK: typeOfActivityId, Field_Of_Activity_Status: true },
                 include: { // Opcional: Incluir Type_Of_Activity si necesitas el nombre también aquí
                    model: Type_Of_Activity,
                    as: 'type_of_activity',
                    attributes: ['Type_Of_Activity_Name']
                }
            });
        } catch (error) {
            // Corregido: Mensaje de error más específico
            throw new Error(`Error retrieving Fields Of Activity by Type Of Activity ID: ${error.message}`);
        }
    }

    static async getByTypeOfActivityIdAndStatus(typeOfActivityId, status) {
        try {
            return await Field_Of_Activity.findAll({
                where: {
                    Type_Of_Activity_FK: typeOfActivityId,
                    Field_Of_Activity_Status: status
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving fields of activity: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            // Reutiliza getById para asegurar que el registro existe y está activo
            const record = await this.getById(id);
            if (!record) return null; // Ya incluye la lógica de status y el include

            // Actualiza el registro
            const [rowsUpdated] = await Field_Of_Activity.update(data, {
                where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true } // Doble check de status por si acaso
            });

            if (rowsUpdated === 0) {
                 // Podría ocurrir si hay una condición de carrera o si el estado cambió entre getById y update
                 console.warn(`Field Of Activity update for ID ${id} reported 0 rows updated despite record found.`);
                 return null; // O re-obtener para confirmar el estado actual
            }

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
                "Field_Of_Activity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el campo de actividad con ID ${id} - Nombre: ${record.Field_Of_Activity_Name}`
            );

            // Devuelve el registro actualizado con la relación incluida
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating Field Of Activity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            // Reutiliza getById para obtener el registro antes de "eliminarlo"
            const record = await this.getById(id);
            if (!record) return null;

            // Realiza el soft delete
            const [rowsUpdated] = await Field_Of_Activity.update(
                { Field_Of_Activity_Status: false },
                { where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true } } // Asegura que solo actualizas si aún está activo
            );

             if (rowsUpdated === 0) {
                 console.warn(`Field Of Activity soft delete for ID ${id} reported 0 rows updated despite record found.`);
                 // Podrías retornar null o el registro original encontrado si la actualización falló
                 return null;
            }

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
                "Field_Of_Activity",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente el campo de actividad con ID ${id} - Nombre: ${record.Field_Of_Activity_Name}`
            );
            // Retorna el registro como estaba *antes* de marcarse como inactivo
            // Opcionalmente, podrías re-consultar si necesitas confirmar el cambio,
            // pero usualmente se retorna el objeto encontrado para indicar qué se "eliminó".
            return record;
        } catch (error) {
            throw new Error(`Error deleting Field Of Activity: ${error.message}`);
        }
    }
}
