import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Zone_Sector = sequelize.define('Zone_Sector', {
    Zone_Sector_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Zone: DataTypes.STRING(30),
    Sector: DataTypes.STRING(80),
    Zone_Sector_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});