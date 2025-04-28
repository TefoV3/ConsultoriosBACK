// models/UserXPeriod_schema.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const UserXPeriod = sequelize.define('UserXPeriod', {
    UserXPeriod_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Period_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Internal_ID: { 
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    UserXPeriod_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: false
});
