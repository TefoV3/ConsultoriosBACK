import { DataTypes } from "sequelize";
import { InitialConsultations } from "./Initial_Consultations.js";
import { sequelize } from "../database/database.js";

export const SocialWork = sequelize.define('SocialWork', {
    ProcessNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ReferralAreaRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ViolenceEpisodes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Complaints: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    DisabilityType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    DisabilityPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    HasDisabilityCard: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    Init_Code: { 
        type: DataTypes.CHAR(50),
        allowNull: false,
    }
});
// Relación uno a uno
SocialWork.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
InitialConsultations.hasOne(SocialWork, { foreignKey: "Init_Code" });