import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Province = sequelize.define('Province', {
    Province_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Province_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Province_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
