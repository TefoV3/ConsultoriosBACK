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

//USO LOCAL

// export const sequelize = new Sequelize(
//     'prueba', 
//     'root', 
//     '12345678', 
//     {
//         host: 'localhost',
//         dialect: 'mysql'
//     }
// );

