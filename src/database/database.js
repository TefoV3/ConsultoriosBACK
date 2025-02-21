import Sequelize from 'sequelize';

export const sequelize = new Sequelize(
    'consultoriosjuridicos', 
    'root', 
    '2444', 
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);