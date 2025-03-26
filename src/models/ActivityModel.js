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

    static async getAllByCodeCase(codeCase) {
        try {
            return await Activity.findAll({
                where: { Init_Code: codeCase }
            });
        } catch (error) {
            throw new Error(`Error retrieving activity: ${error.message}`);
        }
    }

    static async getDocumentById(id) {
        try {
            return await Activity.findOne({
                attributes: ['Documents'],
                where: { Activity_Id: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving document: ${error.message}`);
        }
    }

    static async create(data, file) {
        const t = await sequelize.transaction(); // Crear la transacción
        try {
            console.log("📥 Creando actividad con Internal_ID:", data.Internal_ID); // Log para verificar Internal_ID

            // Crear la actividad usando la transacción
            const newActivity = await Activity.create({
                Activity_ID: data.Activity_ID,
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID, // 📌 Usamos el Internal_ID del usuario autenticado
                Activity_Last: data.Last_Activity,
                Activity_Date: data.Activity_Date,
                Activity_Name: data.Activity_Name,
                Activity_Location: data.Location,
                Activity_Time: data.Time,
                Activity_Duration: data.Duration,
                Activity_Counterparty: data.Counterparty,
                Activity__JudgeName: data.Judge_Name,
                Activity_Reference_File: data.Reference_File,
                Activity_Status: data.Status,
                Activity_Type: data.Activity_Type,
                Activity_OnTime: data.Activity_OnTime,
                Activity_Documents: file ? file.buffer : null
            }, { transaction: t });

            console.log("✅ Actividad creada con ID:", newActivity.Activity_ID); // Log para verificar creación

            // 🔹 Registrar en Audit que un usuario interno creó una actividad
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Activity",
                `El usuario interno ${data.Internal_ID} creó la actividad con ID ${newActivity.Activity_Id}`,
                { transaction: t } // Usar la misma transacción
            );

            await t.commit(); // Confirmar la transacción
            return { message: "Actividad creada con éxito", data: newActivity };
        } catch (error) {
            await t.rollback(); // Revertir la transacción en caso de error
            console.error("❌ Error al crear actividad:", error.message);

            // 🔹 Registrar el error en Audit
            console.log("📥 Registrando error en auditoría con Internal_ID:", data.Internal_ID); // Log para verificar Internal_ID en error
            

            throw new Error(`Error creating activity: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            console.log("📥 Actualizando actividad con Internal_ID:", internalId); // Log para verificar Internal_ID

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
}