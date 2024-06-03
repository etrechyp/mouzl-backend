const { response } = require('express');
const { generateJWT } = require('../middleware/session');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const db = require('../utils/db');
const expiration = 60 * 60 * 24;

const login = async (req, res = response) => {
    const { usuario, contrasena } = req.body;

    try {
        const userQuery = `SELECT * FROM usuarios WHERE usuario = :usuario`;
        const user = await db.query(userQuery, { replacements: { usuario } });

        if (user.length === 0) {
            return res.status(400).json({ message: 'Usuario no existe' });
        }

        const validPassword = bcryptjs.compareSync(contrasena, user[0].contrasena);

        if (!validPassword) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const sessionQuery = `SELECT * FROM sesiones_activas WHERE usuario_id = :userId`;
        const activeSession = await db.query(sessionQuery, { replacements: { userId: user[0].id } });

        const payload = {
            id: user[0].id,
            usuario: user[0].usuario,
            persona_id: user[0].persona_id, 
            rol_id: user[0].rol_id,
            expiresIn: expiration,
        };

        const token = await generateJWT(payload);

        if (activeSession.length > 0) {
            const updateSessionQuery = `
                UPDATE sesiones_activas 
                SET token = :token, vencimiento = DATE_ADD(NOW(), INTERVAL :expiration SECOND)
                WHERE usuario_id = :userId
            `;
            await db.query(updateSessionQuery, { 
                replacements: { userId: user[0].id, token, expiration }
            });
        } else {
            const insertSessionQuery = `
                INSERT INTO sesiones_activas (usuario_id, token, vencimiento) 
                VALUES (:userId, :token, DATE_ADD(NOW(), INTERVAL :expiration SECOND))
            `;
            await db.query(insertSessionQuery, { 
                replacements: { userId: user[0].id, token, expiration }
            });
        }

        res.json({
            user: {
                id: user[0].id,
                rol_id: user[0].rol_id,
                persona_id: user[0].persona_id,
                usuario: user[0].usuario,
            },
            token,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
    }
};


const logout = async (req, res = response) => {
    try {
        const { id } = req.user;

        const deleteSessionQuery = `DELETE FROM sesiones_activas WHERE usuario_id = :userId`;
        await db.query(deleteSessionQuery, { replacements: { userId: id } });

        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
    }
};

const renewToken = async (req, res = response) => {
    const { authorization } = req.headers;
    try {
        if (!authorization) {
            return res.status(400).json({ message: 'No se proporcionó un token' });
        }

        const decoded = jwt.decode(authorization.slice(7));

        const userQuery = `SELECT * FROM usuarios WHERE id = :userId`;
        const user = await db.query(userQuery, { replacements: { userId: decoded.id } });

        if (user.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const payload = {
            id: user[0].id,
            usuario: user[0].usuario,
            rol_id: user[0].rol_id,
            expiresIn: expiration,
        };

        const token = await generateJWT(payload);

        res.json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
    }
};

module.exports = {
    login,
    logout,
    renewToken,
};
