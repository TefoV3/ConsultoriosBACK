import { AuditModel } from "../models/AuditModel.js";
import { Activity } from "../schemas/Activity.js";
import { sequelize } from "../database/database.js";

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

    static async create(data,file) {
        try {
            
            const newActivity = await Activity.create({
                Activity_ID: data.Activity_ID,
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID, // 📌 Usamos el Internal_ID del usuario autenticado
                Last_Activity: data.Last_Activity,
                Activity_Date: data.Activity_Date,
                Activity_Type: data.Activity_Type,
                Location: data.Location,
                Time: data.Time,
                Duration: data.Duration,
                Counterparty: data.Counterparty,
                Judge_Name: data.Judge_Name,
                Reference_File: data.Reference_File,
                Status: data.Status,
                Documents: file ? file.buffer : null // 📌 Guardar el archivo en formato BLOB
            }, { transaction: t });

            // 🔹 Registrar en Audit que un usuario interno creó una actividad
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Activity",
                `El usuario interno ${data.Internal_ID} creó la actividad con ID ${newActivity.Activity_Id}`
            );

            await t.commit(); // 📌 Confirmar la transacción
            return { message: "Actividad creada con éxito", data: newActivity };
        } catch (error) {
            await t.rollback(); // 📌 Revertir la transacción en caso de error
            console.error("❌ Error al crear actividad:", error.message);

            // 🔹 Registrar el error en Audit
            await AuditModel.registerAudit(
                internalId,
                "ERROR",
                "Activity",
                `Error al crear la actividad: ${error.message}`
            );

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
