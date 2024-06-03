const response = require("express");
const db = require("../utils/db");
const { sequelize } = db;

getSpecificEntrega = async (req, res = response) => {
  try {
    entrega = await db.query(
      `SELECT * FROM entregas WHERE id = ${req.params.id}`
    );
    res.status(200).json(entrega[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

getAllEntregas = async (req, res = response) => {
  const { repartidor_id, status } = req.query;

  try {
    let query = `SELECT * FROM entregas WHERE status = '${status}'`;

    if (repartidor_id) {
      query += ` AND repartidor_id = ${repartidor_id}`;
    }

    const entregas = await db.query(query);

    res.status(200).json(entregas);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateEntrega = async (req, res = response) => {
  try {
    const {
      receptor_id,
      fecha_entrega,
      latitude,
      longitude,
      imagen,
      repartidor_id,
      status,
      imagen_id,
    } = req.body;
    const { id } = req.params;

    let query = "UPDATE entregas SET ";
    let updates = [];

    if (receptor_id) {
      updates.push(`receptor_id = '${receptor_id}'`);
    }
    if (fecha_entrega) {
      updates.push(`fecha_entrega = '${fecha_entrega}'`);
    }
    if (latitude) {
      updates.push(`latitude = "${latitude}"`);
    }
    if (longitude) {
      updates.push(`longitude = "${longitude}"`);
    }
    if (imagen) {
      updates.push(`imagen = '${imagen}'`);
    }
    if (repartidor_id) {
      updates.push(`repartidor_id = '${repartidor_id}'`);
    }
    if (imagen_id) {
      updates.push(`imagen_id = '${imagen_id}'`);
    }
    if (status) {
      updates.push(`status = '${status}'`);
    }
    if (updates.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }
    query += updates.join(", ");
    query += ` WHERE id = ${id}`;

    const entrega = await db.query(query);

    res.status(200).json(entrega);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createEntrega = async (req, res = response) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      factura_id,
      nombre,
      fecha,
      direccion,
      latitude,
      longitude,
      receptor_id,
    } = req.body;

    const receptorIdValue = receptor_id ? `${receptor_id}` : 'NULL';

    let query = `
      INSERT INTO entregas (nombre, fecha, factura_id, direccion, receptor_id, latitude, longitude, status) 
      VALUES ('${nombre}', '${fecha}', '${factura_id}', '${direccion}', ${receptorIdValue}, ${latitude}, ${longitude}, 'pendiente')
    `;

    const entrega = await db.query(query, { transaction });

    if (receptor_id) {
      const receptorQuery = `SELECT * FROM personas WHERE id = ${receptor_id}`;
      const receptor = await db.query(receptorQuery, { transaction });

      if (receptor[0].length === 0) {
        if(!transaction.finished){
          await transaction.rollback();
        }
        return res.status(400).json({
          message: "Receptor not found",
        });
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: "created successfully",
      entrega,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
};



module.exports = {
  getSpecificEntrega,
  getAllEntregas,
  updateEntrega,
  createEntrega,
};
