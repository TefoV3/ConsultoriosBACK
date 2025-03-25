/*
CREATE TABLE Registro_Asistencia (
    Registro_ID INT PRIMARY KEY AUTO_INCREMENT,
    Registro_Entrada TIMESTAMP NULL,
    Registro_Salida TIMESTAMP NULL,
    Registro_Tipo VARCHAR(100) NOT NULL,
    Registro_Observaciones VARCHAR(250) NULL,
    Registro_Geolocalizacion VARCHAR(300) NULL,
    Registro_fecha DATETIME NOT NULL,
    Registro_IsDeleted BOOLEAN NOT NULL DEFAULT FALSE
);
*/

import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Registro_Asistencia = sequelize.define('Registro_Asistencia', {
    Registro_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UsuarioXPeriodo_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Registro_Entrada: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Registro_Salida: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Registro_Tipo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Registro_Atraso: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Registro_Observaciones: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    Registro_fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Registro_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
