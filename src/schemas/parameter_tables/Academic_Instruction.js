import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Academic_Instruction = sequelize.define('Academic_Instruction', {
    Academic_Instruction_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Academic_Instruction_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Academic_Instruction_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
