import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Ethnicity = sequelize.define('Ethnicity', {
    Ethnicity_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Ethnicity_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Ethnicity_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
