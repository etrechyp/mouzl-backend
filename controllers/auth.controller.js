const { response } = require("express");
const { generateJWT } = require("../middleware/session");
const JWT = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const dbConnection = require('../utils/dbConnection')

const expiration = 960  

const login = async (req, res = response) => {
    const { username, password } = req.body;

    try {
        const user = await dbConnection.query(`SELECT * FROM usuarios WHERE username = '${username}'`)
        if (!user[0]) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const validPassword = bcryptjs.compareSync(password, user[0].password);
        if (!user[0] || !validPassword) {
            return res.status(400).json({
                message: "Wrong username or password",
            });
        }

        console.log(user)

        let payload = {
            id: user[0].id,
            username: user[0].username,
            rol_id: user[0].rol_id,
            expiresIn: expiration
        }

        const token = await generateJWT(payload);

        res.json({
            user: {
                id: user[0].id,
                rol_id: user[0].rol_id,
                username: user[0].username,
            },
            token,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            err
        });
    }
};

const renewToken = async (req, res = response) => {
    const { authorization } = req.headers;
    try {

        let decoded = JWT.decode(authorization.slice(7))


        const user = await dbConnection.query(`SELECT * from usuarios WHERE id = ${decoded.id}`)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        let payload = {
            id: user[0].id,
            username: user[0].username,
            rol_id: user[0].rol_id,
            expiresIn: expiration
        }

        if (req.headers && authorization.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
            const token = await generateJWT(payload);
            res.json({
                token
            });
        }
    } catch (err) {
        return res.status(500).json({
            err,
        });
    }
};

module.exports = {
    login,
    renewToken
};