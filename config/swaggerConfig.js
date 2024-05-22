const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de gestión de residuos',
      version: '1.0.0',
      description: 'API para la gestión de la app de residuos',
    },
    servers: [{
      url: 'http://localhost:8080'
    }],
  },
  apis: ['./routes/*.js'],  // Asegúrate de que la ruta coincida con la ubicación de tus archivos de ruta
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
