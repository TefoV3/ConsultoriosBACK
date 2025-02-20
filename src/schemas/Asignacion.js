import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Caso } from "./Caso.js";
import { UsuarioInterno } from "./Usuario_interno.js";

/*
CREATE TABLE Asignacion (
    Id_Asignacion INT PRIMARY KEY AUTO_INCREMENT,
    Caso_Codigo CHAR(50) NOT NULL,
    Fecha_Asignacion DATE,
    Interno_Cedula_Est CHAR(10),
    Interno_Cedula CHAR(10) NOT NULL
);
*/

export const Asignacion = sequelize.define('Asignacion', {
    Id_Asignacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Caso_Codigo: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Fecha_Asignacion: DataTypes.DATE,
    Interno_Cedula_Est: DataTypes.CHAR(10), // Cédula del estudiante asignado
    Interno_Cedula: {
        type: DataTypes.CHAR(10),
        allowNull: false
    }
}, { timestamps: false });

Asignacion.belongsTo(Caso, { foreignKey: "Caso_Codigo" });
Asignacion.belongsTo(UsuarioInterno, { foreignKey: "Interno_Cedula" });
Caso.hasMany(Asignacion, { foreignKey: "Caso_Codigo" });
UsuarioInterno.hasMany(Asignacion, { foreignKey: "Interno_Cedula" });
