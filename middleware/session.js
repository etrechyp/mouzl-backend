const { response, request } = require("express");
const JWT = require("jsonwebtoken");
const dbConnection = require('../utils/dbConnection');

const { SECRET } = process.env

const generateJWT = (id) => {
    return new Promise((resolve, reject) => {
        const payload = { id };

        JWT.sign(
            payload,
            SECRET,
            {
                expiresIn: "24h",
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject("Token could not be generated");
                } else {
                    resolve(token);
                }
            }
        );
    });
};

const validateJWT = async (req = request, res = response, next) => {
    const session = req.headers.authorization;

    if (!session) {
        return res.status(401).json({
            message: "Missing token",
        });
    }

    try {
        const token = await session.split(' ')[1];
        const { id } = JWT.verify(token, SECRET);

        const user = await dbConnection.query(`SELECT * from users WHERE id = ${id}`)

        if (!user[0]) {
            return res.status(401).json({
                message: "Invalid token, user no exist",
            });
        }

        req.user = user[0];
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({
            message: "Invalid token",
        });
    }
};

module.exports = {
    generateJWT,
    validateJWT
};