import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Activity } from "./Activity.js";

export const ActivityRecord = sequelize.define('Activity_Record', {
    Record_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Activity_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Activity_Record_Type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Activity_Record_Recorded_Time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Activity_Record_Latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    Activity_Record_Longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    Activity_Record_On_Time: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    Activity_Record_Observation: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, { 
    timestamps: false,
});

// Define associations
ActivityRecord.belongsTo(Activity, { foreignKey: "Activity_ID" });
Activity.hasMany(ActivityRecord, { foreignKey: "Activity_ID" });