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
    try {
        const entregas = await dbConnection.query(`SELECT * FROM entregas`);
        res.status(200).json({ entregas });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

updateEntrega = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { ci_receptor, fecha_entrega, coords, imagen, usuario_id } = req.body

        if (!usuario_id || !fecha_entrega || !ci_receptor || !imagen || !coords) {
            return res.status(409).json({ message: "faltan datos obligatorios" });
        }

        const entrega = await dbConnection.query(
            `UPDATE entregas SET ci_receptor = '${ci_receptor}', fecha_entrega = '${fecha_entrega}', coords = "${coords}", imagen = '${imagen}', usuario_id = ${usuario_id} WHERE id = ${id}`
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
        const { numero_factura } = req.body

        if (!numero_factura) {
            return res.status(409).json({ message: "numero_factura no puede ir vacio" });
        }

        const entrega = await dbConnection.query(`INSERT INTO entregas (numero_factura) VALUES('${numero_factura}')`);
        res.status(201).json({
            message: "created successfully",
            entrega_id: entrega
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
