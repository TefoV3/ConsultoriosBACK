import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Catastrophic_Illness = sequelize.define('Catastrophic_Illness', {
    Catastrophic_Illness_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Catastrophic_Illness_Name: DataTypes.STRING(250),
    Catastrophic_Illness_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });