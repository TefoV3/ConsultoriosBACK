import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Health_Insurance = sequelize.define('Health_Insurance', {
    Health_Insurance_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Health_Insurance_Name: DataTypes.STRING(250),
    Health_Insurance_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});