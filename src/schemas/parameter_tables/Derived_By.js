import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Derived_By = sequelize.define('Derived_By', {
    Derived_By_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Derived_By_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Derived_By_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
