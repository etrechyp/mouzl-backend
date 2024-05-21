const response = require('express');
const dbConnection = require('../utils/dbConnection');

getSpecificEntrega = async (req, res = response) => {
    try {
        entrega = await dbConnection.query(`SELECT * FROM entregas WHERE id = ${req.params.id}`);
        res.status(200).json(entrega[0]);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

getAllEntregas = async (req, res = response) => {
    const { repartidor_id, entregado } = req.query;

    try {
        let query = `SELECT * FROM entregas WHERE entregado = ${entregado}`;

        if (repartidor_id) {
            query += ` AND repartidor_id = ${repartidor_id}`;
        }

        const entregas = await dbConnection.query(query);
        
        res.status(200).json(entregas);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}


updateEntrega = async (req, res = response) => {
    try {
        const { receptor_id, fecha_entrega, coords, imagen, repartidor_id } = req.body

        if (!cliente_id || !fecha_entrega || !receptor_id || !imagen || !coords || !repartidor_id) {
            return res.status(409).json({ message: "faltan datos obligatorios" });
        }

        const entrega = await dbConnection.query(
            `UPDATE entregas SET receptor_id = '${receptor_id}', fecha_entrega = '${fecha_entrega}', coords = "${coords}", imagen = '${imagen}' WHERE cliente_id = ${cliente_id}`
        );

        res.status(204).json({
            entrega_id: entrega
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

createEntrega = async (req, res = response) => {
    try {
        const { 
            factura_id,
            receptor_id,
            coords_entrega: {latitude, longitude}
             } = req.body

        const entrega = await dbConnection.query(`INSERT INTO entregas ( id, entregado, factura_id, receptor_id, latitude, longitude ) VALUES( '${factura_id}', 0, '${factura_id}', '${receptor_id}', ${latitude}, ${longitude})`);
        res.status(201).json({
            message: "created successfully",
            entrega 
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    getSpecificEntrega,
    getAllEntregas,
    updateEntrega,
    createEntrega
}
