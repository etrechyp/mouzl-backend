const { response } = require("express");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const { sequelize } = dbConnection;

const { SALT, SECRET } = process.env;

const getSpecificUser = async (req, res = response) => {
  try {
    const user = await dbConnection.query(
      `SELECT * FROM usuarios WHERE id = ${req.params.id}`
    );
    res.status(200).json(user[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res = response) => {
  try {
    const users = await dbConnection.query("SELECT * FROM usuarios");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyUser = async (req, res = response) => {
  try {
    let token = req.headers.authorization;
    const resp = JWT.verify(token.slice(7), SECRET);

    const usuario = await dbConnection.query(
      `SELECT * FROM usuarios WHERE id = ${resp.id}`
    );
    const persona = await dbConnection.query(
      `SELECT * FROM personas WHERE id = ${usuario[0].persona_id}`
    );

    persona[0].username = resp.username;
    persona[0].rol_id = resp.rol_id;

    res.status(200).json({
      user: usuario[0],
      persona: persona[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createUser = async (req, res = response) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const {
      id,
      usuario,
      nombres,
      apellidos,
      correo,
      contrasena,
      genero,
      fecha_nacimiento,
      telefono,
      direccion,
      rol_id,
    } = req.body;

    if (
      !id ||
      !nombres ||
      !apellidos ||
      !correo ||
      !contrasena ||
      !genero ||
      !usuario ||
      !fecha_nacimiento ||
      !direccion ||
      !telefono
    ) {
      return res.status(409).json({
        message: "Todos los campos obligatorios deben ser proporcionados.",
      });
    }

    let rolId = 2;
    if (rol_id) {
      rolId = rol_id === 1 ? 1 : 2;
    }

    if (contrasena.length < 6) {
      return res.status(409).json({
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    let hashPass = bcryptjs.hashSync(contrasena, Number(SALT));

    await dbConnection.query(
      `
      INSERT INTO personas (id, nombres, apellidos, correo, genero, fecha_nacimiento, telefono, direccion) 
      VALUES (${id}, '${nombres}', '${apellidos}', '${correo}', '${genero}', '${fecha_nacimiento}', '${telefono}', '${direccion}');
      `,
      { transaction }
    );

    await dbConnection.query(
      `
      INSERT INTO usuarios (usuario, contrasena, persona_id, rol_id) 
      VALUES ('${usuario}', '${hashPass}', '${id}', ${rolId})
      `,
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      id,
      nombres,
      apellidos,
      correo,
      rol: rolId,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    res.status(409).json({
      message: error.message,
    });
  }
};


const updateUser = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, correo, contrasena } = req.body;

    let updateUsuariosQuery = `UPDATE usuarios SET`;
    let updatePersonasQuery = `UPDATE personas SET`;

    if (nombres) {
      updatePersonasQuery += ` nombres = '${nombres}',`;
    }
    if (apellidos) {
      updatePersonasQuery += ` apellidos = '${apellidos}',`;
    }
    if (correo) {
      updatePersonasQuery += ` correo = '${correo}',`;
    }
    if (contrasena) {
      const hashedPassword = bcryptjs.hashSync(contrasena, Number(SALT));
      updateUsuariosQuery += ` contrasena = '${hashedPassword}',`;
    }

    updatePersonasQuery =
      updatePersonasQuery.slice(0, -1) + ` WHERE id = '${id}'`;
    updateUsuariosQuery =
      updateUsuariosQuery.slice(0, -1) + ` WHERE persona_id = '${id}'`;

    await dbConnection.query(updatePersonasQuery);
    await dbConnection.query(updateUsuariosQuery);

    res.status(204).json({
      ok: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res = response) => {
  try {
    await dbConnection.query(
      `DELETE FROM usuarios WHERE id = '${req.params.id}'`
    );
    res.status(204).json();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSpecificUser,
  getAllUsers,
  getMyUser,
  createUser,
  updateUser,
  deleteUser,
};
