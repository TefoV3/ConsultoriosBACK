import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const PeriodType = sequelize.define('PeriodType', {
    PeriodType_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PeriodType_Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    PeriodType_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
