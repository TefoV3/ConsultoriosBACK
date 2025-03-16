import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Case } from "./Caso.js";
import { InternalUser } from "./Usuario_interno.js";

/*
CREATE TABLE Assignment (
    Assignment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Case_Code CHAR(50) NOT NULL,
    Assignment_Date DATE,
    Internal_User_ID_Student CHAR(10),
    Internal_User_ID CHAR(10) NOT NULL
);
*/

export const Assignment = sequelize.define('Assignments', {
    Assignment_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Case_Code: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Assignment_Date: DataTypes.DATE,
    Internal_User_ID_Student: DataTypes.CHAR(10), // ID of the assigned student
    Internal_User_ID: {
        type: DataTypes.CHAR(10),
        allowNull: false
    }
}, { timestamps: false });

// Define associations
Assignment.belongsTo(Case, { foreignKey: "Case_Code" });
Assignment.belongsTo(InternalUser, { foreignKey: "Internal_User_ID" });
Case.hasMany(Assignment, { foreignKey: "Case_Code" });
InternalUser.hasMany(Assignment, { foreignKey: "Internal_User_ID" });
