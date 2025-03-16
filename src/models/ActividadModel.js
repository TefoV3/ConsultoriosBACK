import { Activity } from "../schemas/Actividad.js";

export class ActivityModel {

    static async getAll() {
        try {
            return await Activity.findAll();
        } catch (error) {
            throw new Error(`Error retrieving activities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Activity.findOne({
                where: { Activity_Id: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving activity: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Activity.create(data);
        } catch (error) {
            throw new Error(`Error creating activity: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const activity = await this.getById(id);
            if (!activity) return null;

            const [rowsUpdated] = await Activity.update(data, {
                where: { Activity_Id: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating activity: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const activity = await this.getById(id);
            if (!activity) return null;

            await Activity.destroy({ where: { Activity_Id: id } });
            return activity;
        } catch (error) {
            throw new Error(`Error deleting activity: ${error.message}`);
        }
    }
}
