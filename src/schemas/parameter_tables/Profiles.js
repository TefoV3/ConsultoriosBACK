import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Profiles = sequelize.define('Profiles', {
    Profile_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Profile_Name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    Profile_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });