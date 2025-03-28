import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Period_Type = sequelize.define('Period_Type', {
    Period_Type_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Period_Type_Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Period_Type_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
