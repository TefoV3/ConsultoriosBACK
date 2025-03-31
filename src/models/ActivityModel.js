import { AuditModel } from "../models/AuditModel.js";
import { Activity } from "../schemas/Activity.js";
import { sequelize } from "../database/database.js";
import { getUserId } from './sessionData.js';

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
                attributes: ['Activity_Document'],
                where: { Activity_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving document: ${error.message}`);
        }
    }

    static async create(data, file) {
        const t = await sequelize.transaction();
        try {
            const userId = getUserId();
            console.log("📥 Creando actividad con Internal_ID:", userId);
            

            const newActivity = await Activity.create({
                Activity_ID: data.Activity_ID,
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID,
                Activity_Start_Date: data.Activity_Start_Date,
                Activity_Name: data.Activity_Name,
                Activity_Location: data.Activity_Location,
                Activity_Start_Time: data.Activity_Start_Time,
                Activity_Duration: data.Activity_Duration,
                Activity_Counterparty: data.Activity_Counterparty,
                Activity_Judged: data.Activity_Judged,
                Activity_Judge_Name: data.Activity_Judge_Name,
                Activity_Reference_File: data.Activity_Reference_File,
                Activity_Status: data.Activity_Status,
                Activity_OnTime: data.Activity_OnTime,
                Activity_Document: file ? file.buffer : null // Store the Buffer directly if file exists
            }, { transaction: t });
    
            console.log("✅ Actividad creada con ID:", newActivity.Activity_ID);
    
            await AuditModel.registerAudit(
                userId,
                "INSERT",
                "Activity",
                `El usuario interno ${userId} creó la actividad con ID ${newActivity.Activity_ID}`,
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

    static async update(id, activityData, file = null) {
        const t = await sequelize.transaction();
        try {
            const existingActivity = await Activity.findOne({
                where: { Activity_Id: id },
                transaction: t
            });

            if (!existingActivity) {
                await t.rollback();
                return null; // Activity not found
            }

            // Update the activity data
            await existingActivity.update(activityData, { transaction: t });

            // Check if a file was uploaded
            if (file) {
                // Update the document information
                await existingActivity.update({
                    Activity_Document: file.buffer
                }, { transaction: t });
            }

            // Register audit
            await AuditModel.registerAudit(
                activityData.Internal_ID,
                "UPDATE",
                "Activity",
                `El usuario interno ${activityData.Internal_ID} actualizó la actividad con ID ${id}`,
                { transaction: t }
            );

            await t.commit();
            return existingActivity; // Return the updated activity
        } catch (error) {
            await t.rollback();
            console.error("Error updating activity in model:", error);
            throw error;
        }
    }
}