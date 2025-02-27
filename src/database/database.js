import Sequelize from 'sequelize';

export const sequelize = new Sequelize(
    'consultoriosjuridicos', 
    'fvelasco', 
    'ltic', 
    {
        host: '192.168.56.102',
        dialect: 'mysql'
    }
);