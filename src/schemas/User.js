import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { AuditModel } from "../models/AuditModel.js";

/*
CREATE TABLE USER (
    User_ID CHAR(10) PRIMARY KEY,
    User_FirstName CHAR(50),
    User_LastName CHAR(50),
    User_Email CHAR(70),
    User_Phone CHAR(10),
    User_Gender CHAR(50),
    User_Ethnicity CHAR(50),
    User_Profession CHAR(50),
    User_Address CHAR(250),
    User_Nationality CHAR(50),
    User_Dependents INT,
    User_Sector CHAR(10),
    User_Zone CHAR(15),
    User_MaritalStatus CHAR(20),
    User_Disability BOOLEAN,
    User_SocialBenefit BOOLEAN,
    User_BirthDate DATE,
    User_IncomeLevel CHAR(5),
    User_Age INT,
    User_FamilyIncome FLOAT,
    User_OwnsHouse BOOLEAN,
    User_OwnsCar BOOLEAN,
    User_ReferenceName CHAR(50),
    User_ReferencePhone CHAR(10),
    User_IsDeleted BOOLEAN DEFAULT FALSE
);
*/

export const User = sequelize.define('User', {
    User_ID: {
        type: DataTypes.CHAR(10),
        primaryKey: true
    },
    User_ID_Type: DataTypes.STRING(10),
    User_Academic_Instruction: DataTypes.STRING(50),
    User_FirstName: DataTypes.STRING(50),
    User_LastName: DataTypes.STRING(50),
    User_Email: DataTypes.STRING(70),
    User_Phone: DataTypes.STRING(10),
    User_Gender: DataTypes.STRING(50),
    User_Ethnicity: DataTypes.STRING(50),
    User_Profession: DataTypes.STRING(50),
    User_Address: DataTypes.STRING(250),
    User_Nationality: DataTypes.STRING(50),
    User_Dependents: DataTypes.INTEGER,
    User_Sector: DataTypes.STRING(10),
    User_Zone: DataTypes.STRING(15),
    User_MaritalStatus: DataTypes.STRING(20),
    User_Disability: DataTypes.BOOLEAN,
    User_HealthDocuments: DataTypes.BLOB("long"),
    User_SocialBenefit: DataTypes.BOOLEAN,
    User_BirthDate: DataTypes.DATE,
    User_IncomeLevel: DataTypes.STRING(5),
    User_FamilyIncome: DataTypes.FLOAT,
    User_OwnsHouse: DataTypes.BOOLEAN,
    User_OwnsCar: DataTypes.BOOLEAN,
    User_ReferenceName: DataTypes.STRING(50),
    User_ReferencePhone: DataTypes.STRING(10),
    User_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { timestamps: false });

/*

// 🔹 Hook para registrar acciones en `Audit`
User.addHook("afterCreate", async (user) => {
    await AuditModel.registerAudit(user.User_ID, "INSERT", "User", `Se creó el usuario ${user.User_ID}`);
});



// 🔹 Hook para registrar actualizaciones en `Audit`
User.addHook("afterUpdate", async (user) => {
    await AuditModel.registerAudit(
        internalId, 
        "UPDATE",
        "User",
        `El usuario interno ${internalId} actualizó al usuario ${user.User_ID}`
    );
});

// 🔹 Hook para registrar eliminación lógica en `Audit`
User.addHook("afterUpdate", async (user, options) => {
    if (user.User_IsDeleted) {  // Verificar que sea una eliminación lógica
        await AuditModel.registerAudit(
            user.User_ID,
            "DELETE",
            "User",
            `Se eliminó lógicamente el usuario ${user.User_ID}`
        );
    }
});

*/