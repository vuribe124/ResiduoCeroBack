const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
      role_id: role || '1'  // Asegúrate de que el valor predeterminado corresponda con un ID válido en la tabla de roles
    });
    
    // Eliminar la contraseña del objeto antes de enviarlo
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      neighborhood: user.neighborhood,
      phone: user.phone,
      address: user.address,
      role_id: user.role_id
    };

    // Enviar una sola respuesta con la información del usuario y el estado HTTP 201
    res.status(201).json({
      message: 'User successfully registered.',
      user: userResponse
    });
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
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

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
    res.status(201).json({
      message: 'User successfully registered.',
      user: userInfo,
      token: token
    });
  } else {
    res.status(400).send('Authentication failed.');
  }
});

/**
 * @swagger
 * /auth/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     description: Actualiza los detalles del usuario especificado por su ID.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario, debe ser único.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario, debe ser único.
 *               neighborhood:
 *                 type: string
 *                 description: Barrio del usuario.
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario.
 *               address:
 *                 type: string
 *                 description: Dirección del usuario.
 *               role_id:
 *                 type: integer
 *                 description: ID del rol del usuario, por defecto es 1 para usuarios normales.
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al actualizar el usuario.
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, neighborhood, phone, address, role_id } = req.body;

    // Encuentra el usuario por ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Actualiza el usuario
    const updatedUser = await user.update({
      username,
      password,
      email,
      neighborhood,
      phone,
      address,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Error al actualizar el usuario: ' + error.message);
  }
});

/**
 * @swagger
 * /auth/{id}/password:
 *   put:
 *     summary: Cambiar la contraseña de un usuario
 *     description: Permite cambiar la contraseña de un usuario especificado por su ID.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID numérico del usuario cuya contraseña se actualizará
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: La nueva contraseña para el usuario.
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Contraseña actualizada con éxito.
 *       400:
 *         description: La solicitud no contiene la nueva contraseña necesaria.
 *       404:
 *         description: No se encuentra un usuario con el ID proporcionado.
 *       500:
 *         description: Error del servidor al intentar actualizar la contraseña.
 */
router.put('/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ status: 'error', message: 'La nueva contraseña es requerida.' });
    }

    // Encuentra el usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
    }

    // Hashear la nueva contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Actualizar la contraseña del usuario
    await user.update({ password: hashedPassword });

    res.json({ status: 'success', message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar la contraseña: ' + error.message });
  }
});

/**
 * @swagger
 * /auth/send-reset-password-email:
 *   post:
 *     summary: Enviar correo de restablecimiento de contraseña
 *     description: Enviar un correo electrónico con un enlace para restablecer la contraseña de un usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Correo de restablecimiento de contraseña enviado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Error al enviar el correo de restablecimiento de contraseña.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,  // necesario para usar el puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-reset-password-email', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const resetPasswordLink = `http://localhost:4200/auth/reset-password?token=${token}&id=${user.id}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecimiento de Contraseña',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px;">
          <h2 style="color: #333; text-align: center;">Restablecimiento de Contraseña</h2>
          <p style="color: #555;">Hola,</p>
          <p style="color: #555;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetPasswordLink}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Restablecer Contraseña</a>
          </div>
          <p style="color: #555;">Si no solicitaste este cambio, por favor ignora este correo.</p>
          <p style="color: #555;">Gracias,</p>
          <p style="color: #555;">El equipo de soporte</p>
        </div>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: 'success', message: 'Correo de restablecimiento de contraseña enviado.' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ status: 'error', message: 'Error al enviar el correo de restablecimiento de contraseña: ' + error.message });
  }
});


/**
 * @swagger
 * /auth/send-email-contact:
 *   post:
 *     summary: Enviar mensaje de contacto
 *     description: Enviar un mensaje de contacto desde un formulario en el sitio web.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Nombre completo del remitente.
 *               email:
 *                 type: string
 *                 description: Dirección de correo electrónico del remitente.
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del remitente.
 *               message:
 *                 type: string
 *                 description: Mensaje proporcionado por el remitente.
 *             required:
 *               - fullName
 *               - email
 *               - message
 *     responses:
 *       200:
 *         description: Mensaje enviado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor al intentar enviar el mensaje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

router.post('/send-email-contact', async (req, res) => {
  const { fullName, email, message, phone } = req.body;
  console.log("a", req.body.email)
  try {
      let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      await transporter.sendMail({
          from: `"Formulario de Contacto" <${process.env.EMAIL_USER}>`,
          to: "vuribe124@gmail.com",
          subject: "Nuevo mensaje de contacto",
          html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #4A90E2;">Mensaje de Contacto</h2>
              <p><strong>Nombre Completo:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${phone}</p>
              <div style="background-color: #f2f2f2; padding: 10px; margin-top: 10px; border-left: 3px solid #4A90E2;">
                  <strong>Mensaje:</strong>
                  <p>${message}</p>
              </div>
          </div>`
      });

      res.send('Mensaje enviado con éxito');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al enviar el mensaje');
  }
});


module.exports = router;

