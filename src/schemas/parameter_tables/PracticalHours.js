import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const PracticalHours = sequelize.define('PracticalHours', {
    PracticalHours_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Hours: {
        type: DataTypes.DECIMAL(16, 2), 
        allowNull: false
    },
    Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
