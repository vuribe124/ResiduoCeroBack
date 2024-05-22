const { DataTypes } = require('sequelize');
const sequelize = require('../database/databaseConfig');

const Report = sequelize.define('reports', {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    wasteType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photoUrls: {
      type: DataTypes.TEXT, // URL de fotos almacenadas localmente como JSON
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Reportado' // Estado inicial por defecto
    },
    neighborhood: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    directionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true // Activar timestamps para createdAt y updatedAt
  });

module.exports = Report;
