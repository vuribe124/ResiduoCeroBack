const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gestion_residuos', 'root', '1234', {
    host: 'localhost',
    port: 3307,
    dialect: 'mysql'
});

module.exports = sequelize;