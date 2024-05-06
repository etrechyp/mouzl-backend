const { response } = require("express");
const { generateJWT } = require("../middleware/session");
const bcryptjs = require("bcryptjs");
const dbConnection = require('../utils/dbConnection')

const login = async (req, res = response) => {
    const { email, password } = req.body;

    try {
        const user = await dbConnection.query(`SELECT * FROM users WHERE email = '${email}'`)
        if (!user[0]) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const validPassword = bcryptjs.compareSync(password, user[0].password);
        if (!user[0] || !validPassword) {
            return res.status(400).json({
                message: "Wrong email or password",
            });
        }

        const token = await generateJWT(user[0].id);

        res.json({
            user: {
                id: user[0].id,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                email: user[0].email,
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
    const { id } = req.body;
    const { authorization } = req.headers;
    try {
        const user = await dbConnection.query(`SELECT * from users WHERE id = ${id}`)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        if (req.headers && authorization.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
            const token = await generateJWT(user.uid);
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