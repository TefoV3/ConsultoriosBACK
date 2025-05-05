import { AuditModel } from "../models/AuditModel.js";
import { Activity } from "../schemas/Activity.js";
import { sequelize } from "../database/database.js";
import { getUserId } from '../sessionData.js'; // Adjust the import path as necessary
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { Assignment } from "../schemas/Assignment.js"; 

export class ActivityModel {

    static async getAll() {
        try {
            return await Activity.findAll({
                attributes: {
                    exclude: ["Activity_Document"], // Exclude the BLOB field from the result
                },
                order: [['Activity_Start_Date', 'DESC']], // Order by Activity_Start_Date in descending order
            });
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
            const activities = await Activity.findAll({
                where: { Init_Code: codeCase },
                include: [
                    {
                        model: InitialConsultations,
                        as: 'Initial_Consultation', 
                        attributes: ['Init_Code'],
                        required: true,
                        include: [
                            {
                                model: Assignment,
                                as: 'Assignments',
                                attributes: ['Internal_User_ID_Student'],
                                required: false
                            }
                        ]
                    }
                ],
                attributes: {
                    exclude: ["Activity_Document"],
                },
                order: [['Activity_Start_Date', 'DESC']],
                // raw: false, // Ensure raw is not true
            });

            // Process results
            return activities.map((activity, index) => {
                const plainActivity = activity.toJSON();
                // Access using the correct association aliases
                const consultation = plainActivity.Initial_Consultation; // <--- Use expected alias
                const assignments = consultation?.Assignments;          // <--- Use expected nested alias
                const firstAssignment = assignments?.[0];
                const studentId = firstAssignment?.Internal_User_ID_Student;

                // Remove the nested structure using the correct alias
                delete plainActivity.Initial_Consultation; 

                // Add the student ID directly
                plainActivity.Internal_User_ID_Student = studentId || null;

                return plainActivity;
            });

        } catch (error) {
            console.error(`Error retrieving activities by code case (${codeCase}): ${error.message}`);
            // Log the full error for more details if needed
            console.error(error);
            throw new Error(`Error retrieving activities by code case: ${error.message}`);
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

    static async create(data, file, internalUser) {
        const t = await sequelize.transaction();
        try {
            const internalId = internalUser || getUserId();
            console.log("📥 Creando actividad con Internal_ID:", internalId);
            

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
                internalId,
                "INSERT",
                "Activity",
                `El usuario interno ${internalId} creó la actividad con ID ${newActivity.Activity_ID}`,
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

    static async update(id, activityData, file = null, internalUser) {
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

            const internalId = internalUser || getUserId();
            // Register audit
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Activity",
                `El usuario interno ${internalId} actualizó la actividad con ID ${id}`,
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