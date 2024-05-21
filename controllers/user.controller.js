const { response } = require("express");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken")
const dbConnection = require('../utils/dbConnection');

const { SALT, SECRET } = process.env;

const getSpecificUser = async (req, res = response) => {
    try {
        const user = await dbConnection.query(`SELECT * FROM usuarios WHERE id = ${req.params.id}`);
        res.status(200).json(user[0]);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllUsers = async (req, res = response) => {
    try {
        const users = await dbConnection.query('SELECT * FROM usuarios');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyUser = async (req, res = response) => {
    try {
        let token = req.headers.authorization;
        const resp = JWT.verify(token.slice(7), SECRET);

        const usuario = await dbConnection.query(`SELECT * FROM usuarios WHERE id = ${resp.id}`);
        const persona = await dbConnection.query(`SELECT * FROM personas WHERE id = ${usuario[0].persona_id}`);
        
        persona[0].username = resp.username;
        persona[0].rol_id = resp.rol_id;
        
        res.status(200).json({
            user: usuario[0],
            persona: persona[0]
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const createUser = async (req, res = response) => {
    try {
        const { username, firstName, lastName, email, password, genero, fecha_nacimiento, telefono } = req.body;

        if (!firstName || !lastName || !email || !password || !genero || !username || !fecha_nacimiento) {
            return res.status(409).json({ message: "Please fill all fields" });
        }
        if (password.length < 6) {
            return res.status(409).json({ message: "Password must be at least 6 characters" });
        }

        let hashPass = bcryptjs.hashSync(password, Number(SALT));

        const resultPersona = await dbConnection.query(`
            INSERT INTO personas (nombres, apellidos, correo, genero, fecha_nacimiento, telefono) 
            VALUES ('${firstName}', '${lastName}', '${email}', '${genero}', '${fecha_nacimiento}', '${telefono}')
        `);

        const personaId = resultPersona;

        await dbConnection.query(`
            INSERT INTO usuarios (username, password, persona_id, rol_id) 
            VALUES ('${username}', '${hashPass}', '${personaId}', 2)
        `);

        res.status(201).json({
            id: personaId,
            firstName,
            lastName,
            email,
            password: hashPass
        });
    } catch (error) {
        res.status(409).json({
            message: error.message
        });
    }
};

const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, password } = req.body;

        let updateUsuariosQuery = `UPDATE usuarios SET`;
        let updatePersonasQuery = `UPDATE personas SET`;

        if (firstName) {
            updatePersonasQuery += ` nombres = '${firstName}',`;
        }
        if (lastName) {
            updatePersonasQuery += ` apellidos = '${lastName}',`;
        }
        if (email) {
            updatePersonasQuery += ` correo = '${email}',`;
        }
        if (password) {
            const hashedPassword = bcryptjs.hashSync(password, Number(SALT));
            updateUsuariosQuery += ` password = '${hashedPassword}',`;
        }

        updatePersonasQuery = updatePersonasQuery.slice(0, -1) + ` WHERE id = '${id}'`;
        updateUsuariosQuery = updateUsuariosQuery.slice(0, -1) + ` WHERE persona_id = '${id}'`;

        await dbConnection.query(updatePersonasQuery);
        await dbConnection.query(updateUsuariosQuery);

        res.status(204).json({
            ok: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteUser = async (req, res = response) => {
    try {
        await dbConnection.query(`DELETE FROM usuarios WHERE id = '${req.params.id}'`);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getSpecificUser,
    getAllUsers,
    getMyUser,
    createUser,
    updateUser,
    deleteUser
};
