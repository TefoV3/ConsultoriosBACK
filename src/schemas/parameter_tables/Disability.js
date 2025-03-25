import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Disability = sequelize.define('Disability', {
    Disability_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Disability_Name: DataTypes.STRING(250),
    Disability_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });