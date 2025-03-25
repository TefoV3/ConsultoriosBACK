import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Country = sequelize.define('Country', {
    Country_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Country_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Country_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
