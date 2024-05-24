const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/colletionRoutine');
const ColletionRoutine = require('../models/colletionRoutine');

const router = express.Router();

/**
 * @swagger
 * /colletion-routine:
 *   get:
 *      summary: Obtener rutinas de recolección
 *      tags: [ColletionRoutine]
 *      responses:
 *       200:
 *         description: Lista de todas las rutinas de recolección
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ColletionRoutine'
 *       500:
 *         description: Error al recuperar los reportes
 */
router.get('/', async (req, res) => {

    try {
        const colletionRoutineList = await ColletionRoutine.findAll();

        res.status(200).json(colletionRoutineList);
    } catch (error) {
        res.status(400).send('Error al guardar la rutina de recolección: ' + error.message);
    }
});

/**
 * @swagger
 * /colletion-routine/add:
 *   post:
 *     summary: Crear horario de recolección
 *     description: Crea los horarios de recolección de residuos
 *     tags: [ColletionRoutine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - neighborhood
 *               - startHour
 *               - endHour
 *               - weekdays
 *             properties:
 *               neighborhood:
 *                 type: string
 *               startHour:
 *                 type: string
 *               endHour:
 *                 type: string
 *               weekdays:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rutina de recolección creada correctamente 
 *       400:
 *         description: El registro falló debido a un error de entrada
 */

router.post('/add', async (req, res) => {
    const { neighborhood, startHour, endHour, weekdays } = req.body;

    try {
        const colletionRoutine = await ColletionRoutine.create({
            neighborhood,
            startHour,
            endHour,
            weekdays
        });

        res.status(201).json({
            message: 'Se guardo la rutina de recolección correctamente.',
            data: colletionRoutine
        });
    } catch (error) {
        res.status(400).send('Error al guardar la rutina de recolección: ' + error.message);
    }
});



/**
 * @swagger
 * /colletion-routine/update/:id:
 *   post:
 *     summary: Crear horario de recolección
 *     description: Crea los horarios de recolección de residuos
 *     tags: [ColletionRoutine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - neighborhood
 *               - startHour
 *               - endHour
 *               - weekdays
 *             properties:
 *               neighborhood:
 *                 type: string
 *               startHour:
 *                 type: string
 *               endHour:
 *                 type: string
 *               weekdays:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rutina de recolección creada correctamente 
 *       400:
 *         description: El registro falló debido a un error de entrada
 */
router.post('/update/:id', async (req, res) => {
    const id = req.params.id;
    const { neighborhood, startHour, endHour, weekdays } = req.body;

    try {
        const colletionRoutine = await ColletionRoutine.findByPk(id);
        if (colletionRoutine) {
            await colletionRoutine.update({
                neighborhood,
                startHour,
                endHour,
                weekdays,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            res.status(200).json({
                message: 'Se actualizó la rutina de recolección correctamente.',
                data: colletionRoutine
            });
        } else {
            res.status(404).json({
                message: 'No se encontró la rutina de recolección con el ID proporcionado.'
            });
        }
    } catch (error) {
        res.status(400).send('Error al actualizar la rutina de recolección: ' + error.message);
    }
});

module.exports = router;

