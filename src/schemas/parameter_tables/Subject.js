import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Subject = sequelize.define('Subject', {
    Subject_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Subject_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Subject_NRC: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    Subject_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
