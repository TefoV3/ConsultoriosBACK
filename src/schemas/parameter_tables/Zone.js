import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Zone = sequelize.define('Zone_Sector', {
    Zone_Sector_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Zone_Name: DataTypes.STRING(30),
    Zone_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});