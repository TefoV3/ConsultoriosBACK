import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Periodo } from "./Periodo_schema.js";

/*
CREATE TABLE Seguimiento_Semanal (
    Semana_ID INT AUTO_INCREMENT PRIMARY KEY,
    Semana_Numero INT,
    Semana_Ini DATE,
    Semana_Fin DATE,
    Semana_Horas DECIMAL(8,2),
    Semana_Feriado DECIMAL(8,2),
    Semana_Observacion VARCHAR(200),
    Semana_IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Periodo_ID) REFERENCES Periodo(Periodo_ID) ON DELETE RESTRICT
);
*/

export const Seguimiento_Semanal = sequelize.define('Seguimiento_Semanal', {
    Semana_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Periodo_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Semana_Numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Semana_Ini: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Semana_Fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Semana_Horas: {
        type: DataTypes.DECIMAL(8,2),
        allowNull: false,
        defaultValue: 0
    },
    Semana_Feriado: {
        type: DataTypes.DECIMAL(8,2),
        allowNull: false,
        defaultValue: 0
    },
    Semana_Observacion: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    Semana_IsDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Seguimiento_Semanal'
});