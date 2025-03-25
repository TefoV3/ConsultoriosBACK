import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const DerivedBy = sequelize.define('DerivedBy', {
    DerivedBy_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DerivedBy_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    DerivedBy_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
