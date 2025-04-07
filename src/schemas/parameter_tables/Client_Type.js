import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";


export const Client_Type = sequelize.define('Client_Type', {
    Client_Type_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Client_Type_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Client_Type_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });