import { AuditModel } from "../models/AuditModel.js";
import { ActivityRecord } from "../schemas/Activity_Record.js";
import { sequelize } from "../database/database.js";

export class ActivityRecordModel {
    static async getAll() {
        try {
            return await ActivityRecord.findAll();
        } catch (error) {
            throw new Error(`Error retrieving activity records: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await ActivityRecord.findOne({
                where: { Record_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving activity record: ${error.message}`);
        }
    }

    static async getAllByActivityId(activityId) {
        try {
            return await ActivityRecord.findAll({
                where: { Activity_ID: activityId }
            });
        } catch (error) {
            throw new Error(`Error retrieving activity records: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        const t = await sequelize.transaction();
        try {
            console.log("📥 Creating activity record for Activity_ID:", data.Activity_ID);

            const newRecord = await ActivityRecord.create({
                Activity_ID: data.Activity_ID,
                Activity_Record_Type: data.Activity_Record_Type,
                Activity_Record_Recorded_Time: data.Activity_Record_Recorded_Time,
                Activity_Record_Latitude: data.Activity_Record_Latitude,
                Activity_Record_Longitude: data.Activity_Record_Longitude,
                Activity_Record_On_Time: data.Activity_Record_On_Time,
                Activity_Record_Observation: data.Activity_Record_Observation
            }, { transaction: t });

            console.log("✅ Activity record created with ID:", newRecord.Record_ID);

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Activity_Record",
                `User ${internalId} created activity record ${newRecord.Record_ID}`,
                { transaction: t }
            );

            await t.commit();
            return { message: "Activity record created successfully", data: newRecord };
        } catch (error) {
            await t.rollback();
            console.error("❌ Error creating activity record:", error.message);
            throw new Error(`Error creating activity record: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        const t = await sequelize.transaction();
        try {
            console.log("📥 Updating activity record with ID:", id);

            const record = await this.getById(id);
            if (!record) {
                await t.rollback();
                return null;
            }

            const [rowsUpdated] = await ActivityRecord.update(data, {
                where: { Record_ID: id },
                transaction: t
            });

            if (rowsUpdated === 0) {
                await t.rollback();
                return null;
            }

            const updatedRecord = await this.getById(id);

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Activity_Record",
                `User ${internalId} updated activity record ${id}`,
                { transaction: t }
            );

            await t.commit();
            return updatedRecord;
        } catch (error) {
            await t.rollback();
            throw new Error(`Error updating activity record: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        const t = await sequelize.transaction();
        try {
            const record = await this.getById(id);
            if (!record) {
                await t.rollback();
                return null;
            }

            await ActivityRecord.destroy({
                where: { Record_ID: id },
                transaction: t
            });

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Activity_Record",
                `User ${internalId} deleted activity record ${id}`,
                { transaction: t }
            );

            await t.commit();
            return record;
        } catch (error) {
            await t.rollback();
            throw new Error(`Error deleting activity record: ${error.message}`);
        }
    }
}