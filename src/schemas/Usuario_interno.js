import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

/*
CREATE TABLE Usuario_Interno (
    Interno_Cedula CHAR(10) PRIMARY KEY,
    Interno_Nombre CHAR(50),
    Interno_Apellido CHAR(50),
    Interno_Correo CHAR(50),
    Interno_Tipo CHAR(50),
    Interno_Area CHAR(50),
    Interno_Telefono CHAR(10)
);
*/

export const UsuarioInterno = sequelize.define('Usuario_Interno', {
    Interno_Cedula: {
        type: DataTypes.CHAR(10),
        primaryKey: true
    },
    Interno_Nombre: DataTypes.STRING(50),
    Interno_Apellido: DataTypes.STRING(50),
    Interno_Correo: {
        type: DataTypes.STRING(50),
        unique: true
    },
    Interno_Password: DataTypes.STRING(255),
    Interno_Tipo: DataTypes.STRING(50), // Puede ser "Coordinador", "Estudiante", etc.
    Interno_Area: DataTypes.STRING(50), // Área en la que trabaja (Civil, Penal, etc.)
    Interno_Telefono: DataTypes.STRING(10)
}, { timestamps: false });
