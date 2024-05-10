const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const response = require('express');
const dbConnection = require('../utils/dbConnection');

const storagePath = path.join(__dirname, '../storage');

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


//FIXME: revisar NO FUNCIONA
setFile = async (req, res = response) => {
    try {
        const { buffer } = req.file;
        const filename = uuidv4() + path.extname(req.file.originalname);
        
        const filePath = path.join(storagePath, filename);
        fs.writeFileSync(filePath, buffer);

        await dbConnection.query(`UPDATE entregas SET image = ?`, [filePath]);

        res.status(200).json({ message: 'Archivo guardado exitosamente.' });
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
