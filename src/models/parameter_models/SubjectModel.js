import { Subject } from "../../schemas/parameter_tables/Subject.js";

export class SubjectModel {

    static async getAll() {
        try {
            return await Subject.findAll({ where: { Subject_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving subjects: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Subject.findOne({
                where: { Subject_ID: id, Subject_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving subject: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Subject.create(data);
        } catch (error) {
            throw new Error(`Error creating subject: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Subject.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Subject: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            const [rowsUpdated] = await Subject.update(data, {
                where: { Subject_ID: id, Subject_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating subject: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            await Subject.update(
                { Subject_Status: false },
                { where: { Subject_ID: id, Subject_Status: true } }
            );
            return subjectRecord;
        } catch (error) {
            throw new Error(`Error deleting subject: ${error.message}`);
        }
    }
}
