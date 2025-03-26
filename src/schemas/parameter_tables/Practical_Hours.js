import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Practical_Hours = sequelize.define('Practical_Hours', {
    Practical_Hours_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Practical_Hours: {
        type: DataTypes.DECIMAL(16, 2), 
        allowNull: false
    },
    Practical_Hours_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
