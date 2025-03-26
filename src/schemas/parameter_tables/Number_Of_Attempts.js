import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Number_Of_Attempts = sequelize.define('Number_Of_Attempts', {
    Number_Of_Attempts_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Number_Of_Attempts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Number_Of_Attempts_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
