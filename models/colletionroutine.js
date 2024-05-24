const { DataTypes } = require('sequelize');
const sequelize = require('../database/databaseConfig'); // Asegúrate de que la ruta es correcta

const ColletionRoutine = sequelize.define('colletionRoutine', {
    neighborhood: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startHour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endHour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    weekdays: {
      type: DataTypes.STRING,
      allowNull: false
    }
}, {
  // Deshabilita los timestamps
  timestamps: true
});
  
module.exports = ColletionRoutine;