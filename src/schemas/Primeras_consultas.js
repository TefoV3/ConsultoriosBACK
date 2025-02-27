import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";
import { UsuarioInterno } from "./Usuario_interno.js";

/*
CREATE TABLE Primeras_Consultas (
    Prim_Codigo CHAR(50) PRIMARY KEY,
    Interno_Cedula CHAR(10) NOT NULL,
    Prim_TipoCliente CHAR(100),
    Prim_Materia CHAR(250),
    Prim_Abogado CHAR(250),
    Prim_Consultorio CHAR(100),
    Prim_Tema CHAR(250),
    Prim_Servicio CHAR(100),
    Prim_Derivacion CHAR(100),
    Prim_Estado BOOLEAN,
    Usuario_Cedula CHAR(10) NOT NULL
);
*/

export const PrimerasConsultas = sequelize.define('Primeras_Consultas', {
    Prim_Codigo: {
        type: DataTypes.CHAR(50),
        primaryKey: true
    },
    Interno_Cedula: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    
    Prim_TipoCliente: DataTypes.STRING(100),
    Prim_Materia: DataTypes.STRING(250),
    Prim_Abogado: DataTypes.STRING(250),
    Prim_Fecha: DataTypes.DATE,
    Prim_Consultorio: DataTypes.STRING(100),
    Prim_Tema: DataTypes.STRING(250),
    Prim_Derivacion: DataTypes.STRING(100),
    Prim_Estado: DataTypes.BOOLEAN,
    Prim_Provincia: DataTypes.STRING(25),
    Prim_Ciudad: DataTypes.STRING(25),
    Prim_Observaciones: DataTypes.STRING(255),
    Usuario_Cedula: {
        type: DataTypes.CHAR(10),
        allowNull: false
    }

}, { timestamps: false });

PrimerasConsultas.belongsTo(UsuarioInterno, { foreignKey: "Interno_Cedula" });
PrimerasConsultas.belongsTo(Usuario, { foreignKey: "Usuario_Cedula" });
Usuario.hasMany(PrimerasConsultas, { foreignKey: "Usuario_Cedula" });
UsuarioInterno.hasMany(PrimerasConsultas, { foreignKey: "Interno_Cedula" });