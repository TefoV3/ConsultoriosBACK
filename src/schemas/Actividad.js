import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Caso } from "./Caso.js";

/*
CREATE TABLE Actividad (
    Id_Actividad INT PRIMARY KEY AUTO_INCREMENT,
    Caso_Codigo CHAR(50) NOT NULL,
    Interno_Cedula CHAR(10) NOT NULL,
    Act_Ultima_Actividad CHAR(250),
    Act_Fecha_Actv DATE,
    Act_Tipo CHAR(100),
    Act_Ubicacion CHAR(250),
    Act_Hora TIME,
    Act_Duracion TIME,
    Act_Contraparte CHAR(50),
    Act_NombreJuez CHAR(50),
    Act_ExpeReferente CHAR(25),
    Act_Estado CHAR(50),
    Act_Documentos CHAR(250)
);
*/

export const Actividad = sequelize.define('Actividad', {
    Id_Actividad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Caso_Codigo: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Interno_Cedula: DataTypes.CHAR(10),
    Act_Ultima_Actividad: DataTypes.STRING(250),
    Act_Fecha_Actv: DataTypes.DATE,
    Act_Tipo: DataTypes.STRING(100),
    Act_Ubicacion: DataTypes.STRING(250),
    Act_Hora: DataTypes.TIME,
    Act_Duracion: DataTypes.TIME,
    Act_Contraparte: DataTypes.STRING(50),
    Act_NombreJuez: DataTypes.STRING(50),
    Act_ExpeReferente: DataTypes.STRING(25),
    Act_Estado: DataTypes.STRING(50),
    Act_Documentos: DataTypes.STRING(250)
}, { timestamps: false });

Actividad.belongsTo(Caso, { foreignKey: "Caso_Codigo" });
Caso.hasMany(Actividad, { foreignKey: "Caso_Codigo" });