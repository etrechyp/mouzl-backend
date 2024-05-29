const { response } = require("express");
const dbConnection = require("../utils/dbConnection");
const { sequelize } = dbConnection;

const getPersona = async (req, res = response) => {
  try {
    const receptor = await dbConnection.query(
      `SELECT * FROM personas WHERE id = ${req.params.id}`
    );

    res.status(200).json(receptor[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllPersonas = async (req, res = response) => {
  try {
    const personas = await dbConnection.query(`SELECT * FROM personas`);

    res.status(200).json(personas);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const setPersona = async (req, res) => {
  const {
    id,
    nombres,
    apellidos,
    fecha_nacimiento,
    genero,
    correo,
    telefono,
    direccion,
    latitude,
    longitude,
  } = req.body;

  if (!id || !nombres || !apellidos || !telefono || !direccion) {
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser proporcionados.",
    });
  }

  const insertQuery = `
    INSERT INTO personas (id, nombres, apellidos, fecha_nacimiento, genero, correo, telefono, direccion, latitude, longitude, createdAt, updatedAt)
    VALUES ('${id}', '${nombres}', '${apellidos}', ${fecha_nacimiento ? `'${fecha_nacimiento}'` : 'NULL'}, ${genero ? `'${genero}'` : 'NULL'}, ${correo ? `'${correo}'` : 'NULL'}, '${telefono}', '${direccion}', ${latitude ? `'${latitude}'` : 'NULL'}, ${longitude ? `'${longitude}'` : 'NULL'}, NOW(), NOW());
  `;

  const transaction = await sequelize.transaction();

  try {
    await dbConnection.query(insertQuery, { transaction });

    await transaction.commit();
    res.status(201).json({
      id: id,
      message: "Persona creada exitosamente",
    });
  } catch (error) {
    if(!transaction.finished){
      await transaction.rollback();
    }
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const updatePersona = async (req, res = response) => {
  const { id } = req.params;
  const {
    nombres,
    apellidos,
    fecha_nacimiento,
    genero,
    correo,
    telefono,
    direccion,
    latitude,
    longitude,
  } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "ID es requerido para actualizar." });
  }

  const toUpdate = [];

  if (nombres) toUpdate.push(`nombres = '${nombres}'`);
  if (apellidos) toUpdate.push(`apellidos = '${apellidos}'`);
  if (fecha_nacimiento) toUpdate.push(`fecha_nacimiento = '${fecha_nacimiento}'`);
  if (genero) toUpdate.push(`genero = '${genero}'`);
  if (correo) toUpdate.push(`correo = '${correo}'`);
  if (telefono) toUpdate.push(`telefono = '${telefono}'`);
  if (direccion) toUpdate.push(`direccion = '${direccion}'`);
  if (latitude) toUpdate.push(`latitude = ${latitude}`);
  if (longitude) toUpdate.push(`longitude = ${longitude}`);

  if (toUpdate.length === 0) {
    return res.status(400).json({ message: "No hay campos para actualizar." });
  }

  const updateQuery = `
    UPDATE personas
    SET ${toUpdate.join(", ")}, updatedAt = NOW()
    WHERE id = ${id};
  `;

  const transaction = await sequelize.transaction();

  try {
    await dbConnection.query(updateQuery, { transaction });
    await transaction.commit();
    res.status(200).json({
      id,
      message: "Persona actualizada exitosamente",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const deletePersona = async (req, res = response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID es requerido para eliminar." });
  }

  const selectQuery = `
    SELECT * FROM personas WHERE id = ${id};
  `;

  try {
    const existingPersona = await dbConnection.query(selectQuery);

    if (existingPersona.length === 0) {
      return res.status(404).json({ message: "La persona no existe." });
    }

    const deleteQuery = `
      DELETE FROM personas
      WHERE id = ${id};
    `;

    const transaction = await sequelize.transaction();

    try {
      await dbConnection.query(deleteQuery, { transaction });
      await transaction.commit();
      res.status(200).json({ message: "Persona eliminada exitosamente" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: `Error: ${error.message}` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

module.exports = {
  getPersona,
  getAllPersonas,
  setPersona,
  updatePersona,
  deletePersona,
};
