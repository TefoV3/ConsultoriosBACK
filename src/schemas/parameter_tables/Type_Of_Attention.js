import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Type_Of_Attention = sequelize.define('Type_Of_Attention', {
    Type_Of_Attention_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Type_Of_Attention_Name: DataTypes.STRING(250),
    Type_Of_Attention_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });