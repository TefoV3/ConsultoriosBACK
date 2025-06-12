import { Topic } from "../../schemas/parameter_tables/Topic.js";
import { Subject } from "../../schemas/parameter_tables/Subject.js";
import { AuditModel } from "../../models/AuditModel.js";

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

    static async create(data) {
        try {
            const newRecord = await Topic.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Topic",
                            `El usuario interno ${internalId} creó un nuevo registro de Topic con ID ${newRecord.Topic_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating topic: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Topic.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Topic",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Topic.`
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

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Topic",
                `El usuario interno ${internalId} actualizó la Topic con ID ${id}`
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

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Topic",
                `El usuario interno ${internalId} eliminó lógicamente Topic con ID ${id}`
            );
            return topicRecord;
        } catch (error) {
            throw new Error(`Error deleting topic: ${error.message}`);
        }
    }
}
