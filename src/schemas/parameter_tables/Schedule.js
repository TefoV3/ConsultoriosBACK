import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Schedule = sequelize.define('Schedule', {
    Schedule_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Schedule_Limit: DataTypes.INTEGER,
    Schedule_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });