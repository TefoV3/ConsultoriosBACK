import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Pensioner = sequelize.define('Pensioner', {
    Pensioner_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Pensioner_Name: DataTypes.STRING(250),
    Pensioner_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });