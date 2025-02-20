import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Caso } from "./Caso.js";

/*
CREATE TABLE Evidencias (
    Id_Evidencia INT PRIMARY KEY AUTO_INCREMENT,
    Interno_Cedula CHAR(10) NOT NULL,
    Caso_Codigo CHAR(50) NOT NULL,
    Id_Actividad INT NOT NULL,
    Evi_Nombre CHAR(250),
    Evi_Tipo_Documento LONGBLOB,
    Evi_URL CHAR(255),
    Evi_Fecha DATE
);
*/

export const Evidencia = sequelize.define('Evidencias', {
    Id_Evidencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Interno_Cedula: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    Caso_Codigo: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Id_Actividad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Evi_Nombre: DataTypes.STRING(250),
    Evi_Tipo_Documento: DataTypes.BLOB("long"),
    Evi_URL: DataTypes.STRING(255),
    Evi_Fecha: DataTypes.DATE
}, { timestamps: false });

Evidencia.belongsTo(Caso, { foreignKey: "Caso_Codigo" });
Evidencia.belongsTo(Actividad, { foreignKey: "Id_Actividad" });
Caso.hasMany(Evidencia, { foreignKey: "Caso_Codigo" });
Actividad.hasMany(Evidencia, { foreignKey: "Id_Actividad" });
