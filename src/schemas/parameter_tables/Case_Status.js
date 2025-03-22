import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Case_Status = sequelize.define('Case_Status', {
    Case_Status_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Case_Status_Name: DataTypes.STRING(250),
    Case_Status_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});