import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Type_Of_Housing = sequelize.define('Type_Of_Housing', {
    Type_Of_Housing_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Type_Of_Housing_Name: DataTypes.STRING(250),
    Type_Of_Housing_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });