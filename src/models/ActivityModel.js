import { AuditModel } from "../models/AuditModel.js";
import { Activity } from "../schemas/Activity.js";

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

    static async create(data, internalId) {
        try {
            const newActivity = await Activity.create(data);

            // 🔹 Registrar en Audit que un usuario interno creó una actividad
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Activity",
                `El usuario interno ${internalId} creó la actividad con ID ${newActivity.Activity_Id}`
            );

            return newActivity;
        } catch (error) {
            throw new Error(`Error creating activity: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const activity = await this.getById(id);
            if (!activity) return null;

            const [rowsUpdated] = await Activity.update(data, {
                where: { Activity_Id: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedActivity = await this.getById(id);

            // 🔹 Registrar en Audit que un usuario interno actualizó una actividad
            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Activity",
                `El usuario interno ${internalId} actualizó la actividad con ID ${id}`
            );

            return updatedActivity;
        } catch (error) {
            throw new Error(`Error updating activity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const activity = await this.getById(id);
            if (!activity) return null;

            await Activity.destroy({ where: { Activity_Id: id } });

            // 🔹 Registrar en Audit que un usuario interno eliminó una actividad
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Activity",
                `El usuario interno ${internalId} eliminó la actividad con ID ${id}`
            );

            return activity;
        } catch (error) {
            throw new Error(`Error deleting activity: ${error.message}`);
        }
    }
}
