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
                where: { Activity_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving document: ${error.message}`);
        }
    }

    static async create(data, file) {
        const t = await sequelize.transaction();
        try {
            console.log("📥 Creando actividad con Internal_ID:", data.Internal_ID);
    
            const newActivity = await Activity.create({
                Activity_ID: data.Activity_ID,
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID,
                Activity_Last: data.Activity_Last,
                Activity_Date: data.Activity_Date,
                Activity_Name: data.Activity_Name,
                Activity_Location: data.Activity_Location,
                Activity_Time: data.Activity_Time,
                Activity_Duration: data.Activity_Duration,
                Activity_Counterparty: data.Activity_Counterparty,
                Activity_Judged: data.Activity_Judged,
                Activity_Judge_Name: data.Activity_Judge_Name,
                Activity_ReferenceFile: data.Activity_ReferenceFile,
                Activity_Status: data.Activity_Status,
                Activity_Type: data.Activity_Type,
                Activity_OnTime: data.Activity_OnTime,
                Documents: file?.buffer || null
            }, { transaction: t });
    
            console.log("✅ Actividad creada con ID:", newActivity.Activity_ID);
    
            await AuditModel.registerAudit(
                data.Internal_ID,
                "INSERT",
                "Activity",
                `El usuario interno ${data.Internal_ID} creó la actividad con ID ${newActivity.Activity_ID}`,
                { transaction: t }
            );
    
            await t.commit();
            return { message: "Actividad creada con éxito", data: newActivity };
        } catch (error) {
            await t.rollback();
            console.error("❌ Error al crear actividad:", error.message);
            throw new Error(`Error creating activity: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            console.log("📥 Actualizando actividad con Internal_ID:", internalId);

            const activity = await this.getById(id);
            if (!activity) return null;

            const [rowsUpdated] = await Activity.update(data, {
                where: { Activity_ID: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedActivity = await this.getById(id);

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