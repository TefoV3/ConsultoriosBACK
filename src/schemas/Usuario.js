import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

/*
CREATE TABLE USUARIO (
    Usuario_Cedula CHAR(10) PRIMARY KEY,
    Usuario_Nombres CHAR(50),
    Usuario_Apellidos CHAR(50),
    Usuario_Correo CHAR(70),
    Usuario_Telefono CHAR(10),
    Usuario_Genero CHAR(50),
    Usuario_Etnia CHAR(50),
    Usuario_Instruccion CHAR(50),
    Usuario_Ocupacion CHAR(50),
    Usuario_Direccion CHAR(250),
    Usuario_Nacionalidad CHAR(50),
    Usuario_CargasFamiliares INT,
    Usuario_Sector CHAR(10),
    Usuario_Zona CHAR(15),
    Usuario_EstadoCivil CHAR(20),
    Usuario_Discapacidad BOOLEAN,
    Usuario_Bono BOOLEAN,
    Usuario_FechaNacimiento DATE,
    Usuario_NivelDeIngresos CHAR(5),
    Usuario_Edad INT,
    Usuario_Ingresos_familiares FLOAT,
    Usuario_CasaPropia BOOLEAN,
    Usuario_AutoPropio BOOLEAN,
    Usuario_NombreReferencia CHAR(50),
    Usuario_TelReferencia CHAR(10),
    Usuario_IsDeleted BOOLEAN DEFAULT FALSE
);
*/

export const Usuario = sequelize.define('Usuario', {
    Usuario_Cedula: {
        type: DataTypes.CHAR(10),
        primaryKey: true
    },
    Usuario_Nombres: DataTypes.STRING(50),
    Usuario_Apellidos: DataTypes.STRING(50),
    Usuario_Correo: DataTypes.STRING(70),
    Usuario_Telefono: DataTypes.STRING(10),
    Usuario_Genero: DataTypes.STRING(50),
    Usuario_Etnia: DataTypes.STRING(50),
    Usuario_Instruccion: DataTypes.STRING(50),
    Usuario_Ocupacion: DataTypes.STRING(50),
    Usuario_Direccion: DataTypes.STRING(250),
    Usuario_Nacionalidad: DataTypes.STRING(50),
    Usuario_CargasFamiliares: DataTypes.INTEGER,
    Usuario_Sector: DataTypes.STRING(10),
    Usuario_Zona: DataTypes.STRING(15),
    Usuario_EstadoCivil: DataTypes.STRING(20),
    Usuario_Discapacidad: DataTypes.BOOLEAN,
    Usuario_Bono: DataTypes.BOOLEAN,
    Usuario_FechaNacimiento: DataTypes.DATE,
    Usuario_NivelDeIngresos: DataTypes.STRING(5),
    Usuario_Edad: DataTypes.INTEGER,
    Usuario_Ingresos_familiares: DataTypes.FLOAT,
    Usuario_CasaPropia: DataTypes.BOOLEAN,
    Usuario_AutoPropio: DataTypes.BOOLEAN,
    Usuario_NombreReferencia: DataTypes.STRING(50),
    Usuario_TelReferencia: DataTypes.STRING(10),
    Usuario_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { timestamps: false });
