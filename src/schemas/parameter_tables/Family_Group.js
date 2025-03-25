import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Family_Group = sequelize.define('Family_Group', {
    Family_Group_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Family_Group_Name: DataTypes.STRING(250),
    Family_Group_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });