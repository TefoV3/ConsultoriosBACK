import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";

/*
CREATE TABLE CASO (
    Caso_Codigo CHAR(50) PRIMARY KEY,
    Usuario_Cedula CHAR(10) NOT NULL,
    Prim_Codigo CHAR(50) NOT NULL,
    Caso_FechaInicio DATE,
    Caso_FechaUM DATE,
    Caso_Estado VARCHAR(50),
    Caso_Observacion VARCHAR(250),
    Caso_NoCarpeta VARCHAR(50),
    Caso_Viabilidad TINYINT(1),
    Caso_Tema VARCHAR(250),
    Caso_Sede VARCHAR(100),
    Caso_TipoPatrocinio VARCHAR(25),
    Caso_Provincia VARCHAR(25),
    Caso_Ciudad VARCHAR(25),
    Caso_Derivacion VARCHAR(100),
    Caso_NoCausa VARCHAR(30),
    Caso_Juicio VARCHAR(250),
    Caso_TipoJudicatura VARCHAR(256),
    Caso_ResolucionJudicial VARCHAR(255),
    Caso_TipoCliente VARCHAR(50),
    Caso_FechaFin DATE,
    Caso_IsDeleted TINYINT(1) DEFAULT FALSE
);
*/

export const Caso = sequelize.define('Caso', {
    Caso_Codigo: {
        type: DataTypes.CHAR(50),
        primaryKey: true
    },
    Usuario_Cedula: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    Prim_Codigo: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    
    Prim_Codigo: DataTypes.CHAR(50),
    Caso_FechaInicio: DataTypes.DATE,
    Caso_FechaUM: DataTypes.DATE,
    Caso_Estado: DataTypes.STRING(50),
    Caso_Observacion: DataTypes.STRING(250),
    Caso_NoCarpeta: DataTypes.STRING(50),
    Caso_Viabilidad: DataTypes.BOOLEAN,
    Caso_Tema: DataTypes.STRING(250),
    Caso_Sede: DataTypes.STRING(100),
    Caso_TipoPatrocinio: DataTypes.STRING(25),
    Caso_Provincia: DataTypes.STRING(25),
    Caso_Ciudad: DataTypes.STRING(25),
    Caso_Derivacion: DataTypes.STRING(100),
    Caso_NoCausa: DataTypes.STRING(30),
    Caso_Juicio: DataTypes.STRING(250),
    Caso_TipoJudicatura: DataTypes.STRING(255),
    Caso_ResolucionJudicial: DataTypes.STRING(255),
    Caso_TipoCliente: DataTypes.STRING(50),
    Caso_FechaFin: DataTypes.DATE,
    Caso_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { timestamps: false });

Caso.belongsTo(Usuario, { foreignKey: "Usuario_Cedula" });
Caso.belongsTo(PrimerasConsultas, { foreignKey: "Prim_Codigo" });
Usuario.hasMany(Caso, { foreignKey: "Usuario_Cedula" });
PrimerasConsultas.hasOne(Caso, { foreignKey: "Prim_Codigo" });
