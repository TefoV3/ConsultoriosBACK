import { Topic } from "../../schemas/parameter_tables/Topic.js";

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
            return await Topic.create(data);
        } catch (error) {
            throw new Error(`Error creating topic: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const topicRecord = await this.getById(id);
            if (!topicRecord) return null;

            const [rowsUpdated] = await Topic.update(data, {
                where: { Topic_ID: id, Topic_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating topic: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const topicRecord = await this.getById(id);
            if (!topicRecord) return null;

            await Topic.update(
                { Topic_Status: false },
                { where: { Topic_ID: id, Topic_Status: true } }
            );
            return topicRecord;
        } catch (error) {
            throw new Error(`Error deleting topic: ${error.message}`);
        }
    }
}
