const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gestion_residuos', 'root', 'root', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

module.exports = sequelize;