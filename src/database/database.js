import Sequelize from 'sequelize';
/*
export const sequelize = new Sequelize(
    'ConsultoriosJuridicos', 
    'root', 
    '2444', 
    {
        host: 'localhost', 
        dialect: 'mysql'
    }
);*/

//USO LOCAL
 export const sequelize = new Sequelize(
     'prueba', 
     'root', 
     '12345678', 
     {
        host: 'localhost',
        dialect: 'mysql'
     }
 );

