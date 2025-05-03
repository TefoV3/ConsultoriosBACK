import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

/*
CREATE TABLE ResetCodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(10) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires DATETIME NOT NULL,
  UNIQUE KEY unique_user_code (userId, code)
);
*/

//TABLA PARA ALMACENAR TEMPORALMENTE LOS CODIGOS DE RECUPERACION DE CONTRASEÑA
export const ResetPassword = sequelize.define('ResetPassword', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(15),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { timestamps: false });
