const { response } = require("express");
const bcryptjs = require("bcryptjs");
const dbConnection = require('../utils/dbConnection');

const { SALT } = process.env

const getSpecificUser = async (req, res = response) => {
    try {
        const user = await dbConnection.query(`SELECT * FROM users WHERE id = ${req.params.id}`);
        res.status(200).json(user[0]);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllUsers = async (req, res = response) => {
    try {
        const users = await dbConnection.query('SELECT * FROM users');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const createUser = async (req, res = response) => {
    try {
        const { firstName, lastName, email, password } = req.body

        if (!firstName || !lastName || !email || !password) {
            return res.status(409).json({ message: "please fill all fields" });
        }
        if (password.length < 6) {
            return res.status(409).json({ message: "password must be at least 6 characters" });
        }

        let hashPass = bcryptjs.hashSync(password, Number(SALT));

        const response = await dbConnection.query(`INSERT into users (firstName, lastName, email, password) values('${firstName}','${lastName}','${email}','${hashPass}')`)

        res.status(201).json({
            id: response,
            firstName,
            lastName,
            email,
            password: hashPass
        })
    } catch (error) {
        res.status(409).json({
            message: error.message
        })
    }
};

const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, password } = req.body;

        let updateQuery = `UPDATE users SET`;

        if (firstName) {
            updateQuery += ` firstName = '${firstName}',`;
        }
        if (lastName) {
            updateQuery += ` lastName = '${lastName}',`;
        }
        if (email) {
            updateQuery += ` email = '${email}',`;
        }
        if (password) {
            const hashedPassword = bcryptjs.hashSync(password, NUmber(SALT));
            updateQuery += ` password = '${hashedPassword}',`;
        }

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ` WHERE id = ${id}`;

        await dbConnection.query(updateQuery);

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
        const user = await dbConnection.query(`DELETE FROM users WHERE id = ${req.params.id}`);
        res.status(204).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getSpecificUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};