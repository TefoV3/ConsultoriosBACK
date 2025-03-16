import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { User } from "./Usuario.js";
import { InitialConsultations } from "./Primeras_consultas.js";

/*
CREATE TABLE Case (
    Case_Code CHAR(50) PRIMARY KEY,
    User_ID CHAR(10) NOT NULL,
    Init_Code CHAR(50) NOT NULL,
    Case_StartDate DATE,
    Case_LastModifiedDate DATE,
    Case_Status VARCHAR(50),
    Case_Observation VARCHAR(250),
    Case_FolderNumber VARCHAR(50),
    Case_Viability TINYINT(1),
    Case_Topic VARCHAR(250),
    Case_Office VARCHAR(100),
    Case_SponsorshipType VARCHAR(25),
    Case_Province VARCHAR(25),
    Case_City VARCHAR(25),
    Case_Referral VARCHAR(100),
    Case_CauseNumber VARCHAR(30),
    Case_Trial VARCHAR(250),
    Case_JudiciaryType VARCHAR(256),
    Case_JudicialResolution VARCHAR(255),
    Case_ClientType VARCHAR(50),
    Case_EndDate DATE,
    Case_IsDeleted TINYINT(1) DEFAULT FALSE
);
*/

export const Case = sequelize.define('Cases', {
    Case_Code: {
        type: DataTypes.CHAR(50),
        primaryKey: true
    },
    User_ID: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    Init_Code: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Case_StartDate: DataTypes.DATE,
    Case_LastModifiedDate: DataTypes.DATE,
    Case_Status: DataTypes.STRING(50),
    Case_Observation: DataTypes.STRING(250),
    Case_FolderNumber: DataTypes.STRING(50),
    Case_Viability: DataTypes.BOOLEAN,
    Case_Topic: DataTypes.STRING(250),
    Case_Office: DataTypes.STRING(100),
    Case_SponsorshipType: DataTypes.STRING(25),
    Case_Province: DataTypes.STRING(25),
    Case_City: DataTypes.STRING(25),
    Case_Referral: DataTypes.STRING(100),
    Case_CauseNumber: DataTypes.STRING(30),
    Case_Trial: DataTypes.STRING(250),
    Case_JudiciaryType: DataTypes.STRING(255),
    Case_JudicialResolution: DataTypes.STRING(255),
    Case_ClientType: DataTypes.STRING(50),
    Case_EndDate: DataTypes.DATE,
    Case_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { timestamps: false });

// Define associations
Case.belongsTo(User, { foreignKey: "User_ID" });
Case.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
User.hasMany(Case, { foreignKey: "User_ID" });
InitialConsultations.hasOne(Case, { foreignKey: "Init_Code" });
