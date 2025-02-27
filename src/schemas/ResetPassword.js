import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

/*
-- Ejemplo de tabla en MySQL:
CREATE TABLE ResetCodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(10) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires DATETIME NOT NULL,
  UNIQUE KEY unique_user_code (userId, code)
);
*/

export const ResetPassword = sequelize.define('ResetPassword', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(10),
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
