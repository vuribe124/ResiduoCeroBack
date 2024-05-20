const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea un nuevo usuario con el nombre de usuario, la contraseña y otros detalles proporcionados.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - neighborhood
 *               - phone
 *               - address
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               neighborhood:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: number
 *                 description: "Role of the user, e.g., ''administrador'', 'user'"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El registro falló debido a un error de entrada
 */
router.post('/register', async (req, res) => {
  const { username, password, email, neighborhood, phone, address, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      neighborhood,
      phone,
      address,
      role_id: role || '1'
    });
    res.status(201).send('User successfully registered.');
  } catch (error) {
    res.status(400).send('Error registering user: ' + error.message);
  }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: Authenticates user and returns a JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa, JWT devuelto
 *       401:
 *         description: Error de autenticación, nombre de usuario o contraseña no válidos
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' }); // Cambia 'your_secret_key' por tu clave secreta

    // Crea un objeto con la información del usuario que quieres devolver
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      neighborhood: user.neighborhood,
      phone: user.phone,
      address: user.address,
      role: user.role
    };

    // Devuelve tanto el token como la información del usuario
    res.json({ token, userInfo });
  } else {
    res.status(401).send('Authentication failed.');
  }
});

module.exports = router;

