import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Profiles = sequelize.define('Profiles', {
    Profile_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Profile_Name: DataTypes.STRING(250),
    Profile_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});