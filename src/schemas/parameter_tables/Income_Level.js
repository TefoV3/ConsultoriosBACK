import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Income_Level = sequelize.define('Income_Level', {
    Income_Level_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Income_Level_Name: DataTypes.STRING(250),
    Income_Level_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});