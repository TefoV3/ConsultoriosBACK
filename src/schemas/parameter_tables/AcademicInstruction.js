import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const AcademicInstruction = sequelize.define('AcademicInstruction', {
    AcademicInstruction_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    AcademicInstruction_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    AcademicInstruction_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
