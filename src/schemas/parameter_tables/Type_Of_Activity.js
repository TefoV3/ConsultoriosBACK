import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Type_Of_Activity = sequelize.define('Type_Of_Activity', {
    Type_Of_Activity_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Type_Of_Activity_Name: DataTypes.STRING(250),
    Type_Of_Activity_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });