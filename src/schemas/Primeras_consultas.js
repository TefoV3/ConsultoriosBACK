import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { User } from "./Usuario.js";
import { InternalUser } from "./Usuario_interno.js";

/*
CREATE TABLE Initial_Consultations (
    Init_Code CHAR(50) PRIMARY KEY,
    Internal_ID CHAR(10) NOT NULL,
    Init_ClientType CHAR(100),
    Init_Subject CHAR(250),
    Init_Lawyer CHAR(250),
    Init_Office CHAR(100),
    Init_Topic CHAR(250),
    Init_Service CHAR(100),
    Init_Referral CHAR(100),
    Init_Status BOOLEAN,
    User_ID CHAR(10) NOT NULL
);
*/

export const InitialConsultations = sequelize.define('Initial_Consultations', {
    Init_Code: {
        type: DataTypes.CHAR(50),
        primaryKey: true
    },
    Internal_ID: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    Init_ClientType: DataTypes.STRING(100),
    Init_Subject: DataTypes.STRING(250),
    Init_Lawyer: DataTypes.STRING(250),
    Init_Date: DataTypes.DATE,
    Init_Office: DataTypes.STRING(100),
    Init_Topic: DataTypes.STRING(250),
    Init_Referral: DataTypes.STRING(100),
    Init_Status: DataTypes.BOOLEAN,
    Init_Province: DataTypes.STRING(25),
    Init_City: DataTypes.STRING(25),
    Init_Notes: DataTypes.STRING(255),
    User_ID: {
        type: DataTypes.CHAR(10),
        allowNull: false
    }

}, { timestamps: false });

InitialConsultations.belongsTo(InternalUser, { foreignKey: "Internal_ID" });
InitialConsultations.belongsTo(User, { foreignKey: "User_ID" });
User.hasMany(InitialConsultations, { foreignKey: "User_ID" });
InternalUser.hasMany(InitialConsultations, { foreignKey: "Internal_ID" });