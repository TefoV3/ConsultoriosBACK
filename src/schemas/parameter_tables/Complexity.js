import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Complexity = sequelize.define('Complexity', {
    Complexity_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Complexity_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Complexity_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
