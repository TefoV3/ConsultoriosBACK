import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Parameters = sequelize.define("Parameters", {
  zone: {
    type: DataTypes.ENUM("Urbano", "Rural", "Frontera"),
    allowNull: true,
    comment: "Geographical zone",
  },
  sector: {
    type: DataTypes.ENUM(
      "Belisario Quevedo", "Carcelén", "Centro Histórico", "Chilibulo", 
      "Chillogallo", "Chimbacalle", "Cochapamba", "Comité del Pueblo", 
      "Concepción", "Cotocollao", "El Condado", "El Inca", "Guamaní", 
      "Iñaquito", "Itchimbía", "Jipijapa", "Kennedy", "La Argelia", 
      "La Ecuatoriana", "La Ferroviaria", "La Libertad", "La Mena", 
      "Magdalena", "Mariscal Sucre", "Ponceano", "Puengasí", "Quitumbe", 
      "Rumipamba", "San Bartolo", "San Juan", "Solanda", "Turubamba", 
      "Alangasí", "Amaguaña", "Atahualpa", "Calacalí", "Calderón", 
      "Chavezpamba", "Checa", "Cumbayá", "Gualea", "Guangopolo", 
      "Guayllabamba", "Llano Chico", "Lloa", "La Merced", "Nanegal", 
      "Nanegalito", "Nayón", "Nono", "Pacto", "Perucho", "Pifo", 
      "Píntag", "Pomasqui", "Puéllaro", "Puembo", "El Quinche", 
      "San Antonio de Pichincha", "San José de Minas", "Tababela", 
      "Tumbaco", "Yaruquí", "Zámbiza"
    ),
    allowNull: true,
    comment: "Economic sector",
  },
  province: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "Province name",
  },
  city: {
    type: DataTypes.STRING(40),
    allowNull: true,
    comment: "City name",
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Country name",
  },
  ethnicity: {
    type: DataTypes.ENUM("Indigenous", "Afro-descendant", "Mestizo", "Other"),
    allowNull: true,
    comment: "Ethnic group",
  },
  maritalStatus: {
    type: DataTypes.ENUM("Single", "Married", "Divorced", "Widowed", "Other"),
    allowNull: true,
    comment: "Marital status",
  },
  gender: {
    type: DataTypes.ENUM("Masculino", "Femenino", "LGTBIQ+"),
    allowNull: true,
    comment: "Gender",
  },
  referredBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Referred by whom",
  },
  educationLevel: {
    type: DataTypes.ENUM("Primary", "Secondary", "Tertiary", "Other"),
    allowNull: true,
    comment: "Level of education",
  },
  occupation: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "Occupation",
  },
  personalIncomeLevel: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    allowNull: true,
    comment: "Income level",
  },
  familyGroup: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: "Family group description",
  },
  economicallyActivePersons: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "Economically active persons in family",
  },
  familyIncome: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Family income level",
  },
  housingType: {
    type: DataTypes.ENUM("Owned", "Rented", "Other"),
    allowNull: true,
    comment: "Type of housing",
  },
  ownAssets: {
    type: DataTypes.STRING(35),
    allowNull: true,
    comment: "Description of owned assets",
  },
  receivesBonus: {
    type: DataTypes.ENUM("Yes", "No"),
    allowNull: true,
    comment: "Receives bonus",
  },
  pensioner: {
    type: DataTypes.STRING(35),
    allowNull: true,
    comment: "Pensioner status",
  },
  healthInsurance: {
    type: DataTypes.ENUM("Public", "Private", "None"),
    allowNull: true,
    comment: "Type of health insurance",
  },
  supportDocuments: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "Description of support documents",
  },
  vulnerabilitySituation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Vulnerability situation description",
  },
  catastrophicIllness: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "Description of catastrophic illness",
  },
  disability: {
    type: DataTypes.ENUM("Yes", "No"),
    allowNull: true,
    comment: "Disability status",
  },
  disabilityPercentage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "Percentage of disability",
  },
  backupDocument: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "Backup document description",
  },
  protocol: {
    type: DataTypes.STRING(25),
    allowNull: true,
    comment: "Protocol information",
  },
  alert: {
    type: DataTypes.ENUM("High", "Medium", "Low", "None"),
    allowNull: true,
    comment: "Alert level",
  },
  attachments: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: "Attachments description",
  },
  attentionType: {
    type: DataTypes.ENUM("Immediate", "Scheduled", "Follow-up"),
    allowNull: true,
    comment: "Type of attention required",
  },
  caseStatus: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Status of the case",
  },
  automatic: {
    type: DataTypes.ENUM("Yes", "No"),
    allowNull: true,
    comment: "Automatic processing status",
  },
  area: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: "Area related to the case",
  },
  topic: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Topic or subject of the case",
  },
});