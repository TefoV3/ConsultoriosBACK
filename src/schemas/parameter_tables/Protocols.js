import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Protocols = sequelize.define('Protocols', {
    Protocol_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Protocol_Name: DataTypes.STRING(250),
    Protocol_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});