import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const NumberOfAttempts = sequelize.define('NumberOfAttempts', {
    NumberOfAttempts_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Attempts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
