import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Own_Assets = sequelize.define('Own_Assets', {
    Own_Assets_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Own_Assets_Name: DataTypes.STRING(250),
    Own_Assets_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });