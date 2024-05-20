const { DataTypes } = require('sequelize');
const sequelize = require('../database/databaseConfig'); // Asegúrate de que la ruta es correcta

const User = sequelize.define('users', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER, // Cambiado de NUMBER a INTEGER para mayor compatibilidad
    allowNull: false,
    defaultValue: 1
  }
}, {
  // Deshabilita los timestamps
  timestamps: false
});

module.exports = User;

