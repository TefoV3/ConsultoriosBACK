import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Family_Income = sequelize.define('Family_Income', {
    Family_Income_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Family_Income_Name: DataTypes.STRING(250),
    Family_Income_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });