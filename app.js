const express = require('express');
const cors = require('cors');  // Importa CORS
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swaggerConfig'); 
const authRoutes = require('./routes/authRoutes'); 
const reportsRoutes = require('./routes/reportsRoutes'); 

const app = express();

// Configura CORS de manera global
app.use(cors({
    origin: '*',  // Permite todas las origenes, ajusta esto según tus requerimientos de seguridad
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRoutes);
app.use('/reports', reportsRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;

