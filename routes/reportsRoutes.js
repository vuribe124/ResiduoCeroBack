const express = require('express');
const multer = require('multer');
const Report = require('../models/reports');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento de archivos con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        // Crear el directorio si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Asignar nombre de archivo único
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const router = express.Router();

/**
 * @swagger
 * /reports/addReport:
 *   post:
 *     summary: Crea un nuevo reporte de residuos
 *     description: Permite a los usuarios reportar incidentes de residuos especificando detalles y subiendo fotos.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - wasteType
 *               - photos
 *             properties:
 *               description:
 *                 type: string
 *                 description: Descripción del problema de residuos
 *               wasteType:
 *                 type: string
 *                 description: Tipo de residuo reportado
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fotos relacionadas con el problema de residuos
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *       500:
 *         description: Error al crear el reporte
 */
router.post('/addReport', upload.array('photos'), async (req, res) => {
    // Extracción de todos los campos necesarios desde req.body
    const { description, wasteType, neighborhood, address, directionNotes } = req.body;
    // Conversión de los archivos de fotos a URL, asumiendo que se almacenan localmente y se accede mediante rutas
    const photoUrls = req.files.map(file => file.path);

    try {
        // Creación del reporte con todos los campos necesarios
        const report = await Report.create({
            description,
            wasteType,
            photoUrls: JSON.stringify(photoUrls), // Guardar como JSON si necesitas almacenar múltiples URLs
            neighborhood,   // Asegúrate de que este campo esté presente y sea válido
            address,        // Asegúrate de que este campo esté presente y sea válido
            directionNotes, // Este campo es opcional
            status: 'Reportado'
        });
        // Envío de la respuesta con el reporte creado
        res.status(201).json(report);
    } catch (error) {
        // Manejo de errores en caso de fallas al crear el reporte
        res.status(500).send('Error creating report: ' + error.message);
    }
});


/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Obtiene todos los reportes de residuos
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Lista de todos los reportes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Error al recuperar los reportes
 */
router.get('/', async (req, res) => {
    try {
        const reports = await Report.findAll();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).send('Error retrieving reports: ' + error.message);
    }
});

/**
 * @swagger
 * /reports/{id}/status:
 *   put:
 *     summary: Actualiza el estado de un reporte
 *     description: Permite a los administradores actualizar el estado de un reporte específico.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: El nuevo estado del reporte
 *     responses:
 *       200:
 *         description: Estado del reporte actualizado exitosamente
 *       500:
 *         description: Error al actualizar el estado del reporte
 */
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const report = await Report.findByPk(req.params.id);
        report.status = status;
        await report.save();
        res.status(200).json(report);
    } catch (error) {
        res.status(500).send('Error updating report: ' + error.message);
    }
});

router.get("/imagen/:nombre", (req, res) => {
    const nombreImagen = req.params.nombre;
    try{
        res.sendFile(path.join(__dirname, "../uploads", nombreImagen));
    } catch (error) {
        res.status(500).send('Error en recuperar la imagen: ' + error.message);
    }
});

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Obtiene los detalles de un reporte
 *     description: Permite a los usuarios obtener toda la información de un reporte específico.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte a consultar
 *     responses:
 *       200:
 *         description: Datos del reporte obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Reporte no encontrado
 *       500:
 *         description: Error al obtener el reporte
 */
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);
        if (!report) {
            return res.status(404).send('Report not found');
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).send('Error retrieving report: ' + error.message);
    }
});

module.exports = router;
