import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Occupations = sequelize.define('Occupations', {
    Occupation_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Occupation_Name: DataTypes.STRING(250),
    Occupation_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });