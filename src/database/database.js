import Sequelize from 'sequelize';

export const sequelize = new Sequelize(
    'prueba', 
    'root', 
    '12345678', 
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);