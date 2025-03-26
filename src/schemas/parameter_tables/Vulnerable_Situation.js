import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Vulnerable_Situation = sequelize.define('Vulnerable_Situation', {
    Vulnerable_Situation_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Vulnerable_Situation_Name: DataTypes.STRING(250),
    Vulnerable_Situation_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });