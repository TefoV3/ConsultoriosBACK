import { Topic } from "../../schemas/parameter_tables/Topic.js";
import { Subject } from "../../schemas/parameter_tables/Subject.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class TopicModel {

    static async getAll() {
        try {
            return await Topic.findAll({
                where: { Topic_Status: true },
                include: {
                    model: Subject, // Incluir los datos de Subject en la consulta
                    as: 'subject', // Usamos el alias definido en el schema
                    attributes: ['Subject_Name'] // Los atributos que queremos incluir del Subject
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving topics: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Topic.findOne({
                where: { Topic_ID: id, Topic_Status: true },
                include: {
                    model: Subject,
                    as: 'subject',
                    attributes: ['Subject_Name']
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving topic: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre no exista
            const existingRecord = await Topic.findOne({
                where: {
                    Topic_Name: data.Topic_Name,
                    Subject_FK: data.Subject_FK,
                    Topic_Status: true
                }
            });
            if (existingRecord) {
                throw new Error(`Ya existe un registro de Topic con el nombre ${data.Topic_Name} para el Subject con ID ${data.Subject_FK}`);
            }
            const newRecord = await Topic.create(data);
            
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
                "Topic",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Topic con ID ${newRecord.Topic_ID} - Nombre: ${newRecord.Topic_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating topic: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Topic.bulkCreate(data);
            
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
                "Topic",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Topic.`
            );
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Topic: ${error.message}`);
        }
    }

    static async getBySubjectId(subjectId) {
        try {
            return await Topic.findAll({
                where: { Subject_FK: subjectId, Topic_Status: true },
            });
        } catch (error) {
            throw new Error(`Error retrieving topics by subject ID: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const topicRecord = await this.getById(id);
            if (!topicRecord) return null;

            const [rowsUpdated] = await Topic.update(data, {
                where: { Topic_ID: id, Topic_Status: true }
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
                "Topic",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Topic con ID ${id} - Nombre: ${topicRecord.Topic_Name}`
            );

            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating topic: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const topicRecord = await this.getById(id);
            if (!topicRecord) return null;

            await Topic.update(
                { Topic_Status: false },
                { where: { Topic_ID: id, Topic_Status: true } }
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
                "Topic",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Topic con ID ${id} - Nombre: ${topicRecord.Topic_Name}`
            );
            return topicRecord;
        } catch (error) {
            throw new Error(`Error deleting topic: ${error.message}`);
        }
    }
}
