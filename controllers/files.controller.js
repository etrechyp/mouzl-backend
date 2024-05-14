const fs = require('fs');
const path = require('path');
const multer = require('multer');

const response = require('express');
const dbConnection = require('../utils/dbConnection');

const storagePath = path.join(__dirname, '../storage');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storagePath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

getFile = async (req, res = response) => {
    try {
        const entregas = await dbConnection.query(`SELECT * FROM entregas`);
        res.status(200).json(entregas[0]);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

setFile = async (req, res = response) => {
    try {
        upload.single('file')(req, res, async function (res, err) {
            console.log(res)
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: err.message });
            }

            // Aquí el archivo ha sido cargado correctamente
            // Puedes acceder al archivo en req.file

            // Procesar el archivo si es necesario

            // Enviar respuesta al cliente
            res.status(200).json({ message: 'Archivo guardado exitosamente.', res });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    getFile,
    setFile
}
