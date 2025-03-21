import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { InitialConsultations } from "./Initial_Consultations.js";
import { InternalUser } from "./Internal_User.js";

/*
CREATE TABLE Assignment (
    Assignment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Init_Code CHAR(50) NOT NULL, 
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
    Init_Code: { // Cambiar Case_Code a Init_Code
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
Assignment.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
Assignment.belongsTo(InternalUser, { foreignKey: "Internal_User_ID" });
InitialConsultations.hasMany(Assignment, { foreignKey: "Init_Code" });
InternalUser.hasMany(Assignment, { foreignKey: "Internal_User_ID" });
