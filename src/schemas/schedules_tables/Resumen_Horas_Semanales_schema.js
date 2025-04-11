// Resumen_Horas_Semanales_schema.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

/*
CREATE TABLE Resumen_Horas_Semanales (
    ResumenSem_ID INT AUTO_INCREMENT PRIMARY KEY,
    ResumenGeneral_ID INT NOT NULL,
    Semana_Inicio DATE NOT NULL,
    Semana_Fin DATE NOT NULL,
    Horas_Asistencia DECIMAL(5,2) DEFAULT 0,
    ResumenSem_IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ResumenGeneral_ID) REFERENCES Resumen_Horas_Estudiantes(Resumen_ID) ON DELETE RESTRICT
);
*/

export const Resumen_Horas_Semanales = sequelize.define('Resumen_Horas_Semanales', {
  ResumenSem_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ResumenGeneral_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Semana_Numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
    },
  Semana_Inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Semana_Fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Horas_Asistencia: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0
  },
  ResumenSem_IsDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});
