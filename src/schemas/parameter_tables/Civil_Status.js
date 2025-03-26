import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Civil_Status = sequelize.define('Civil_Status', {
    Civil_Status_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Civil_Status_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Civil_Status_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
