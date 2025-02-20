import Sequelize from 'sequelize';

export const sequelize = new Sequelize(
    'consultoriosjbd', 
    'root', 
    '2444', 
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);