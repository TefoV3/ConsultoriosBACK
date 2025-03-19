import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Parameters = sequelize.define("Parameters", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "Primary key, autoincrementable",
  },
  zone: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: "",
  },
  sector: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "",
  },
  province: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: "",
  },
  city: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: "",
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "",
  },
  ethnicity: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  maritalStatus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: "",
  },
  referredBy: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: "",
  },
  educationLevel: {
    type: DataTypes.STRING(40),
    allowNull: true,
    comment: "",
  },
  occupation: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: "",
  },
  personalIncomeLevel: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: "",
  },
  familyGroup: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: "",
  },
  economicallyActivePersons: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "",
  },
  familyIncome: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  housingType: {
    type: DataTypes.STRING(70),
    allowNull: true,
    comment: "",
  },
  ownAssets: {
    type: DataTypes.STRING(70),
    allowNull: true,
    comment: "",
  },
  receivesBonus: {
    type: DataTypes.STRING(3),
    allowNull: true,
    comment: "",
  },
  pensioner: {
    type: DataTypes.STRING(35),
    allowNull: true,
    comment: "",
  },
  healthInsurance: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  supportDocuments: {
    type: DataTypes.STRING(40),
    allowNull: true,
    comment: "",
  },
  vulnerabilitySituation: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "",
  },
  catastrophicIllness: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "",
  },
  disability: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "",
  },
  disabilityPercentage: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  protocol: {
    type: DataTypes.STRING(25),
    allowNull: true,
    comment: "",
  },
  attachments: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: "",
  },
  attentionType: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: "",
  },
  caseStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "",
  },
  area: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "",
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "",
  },
});
