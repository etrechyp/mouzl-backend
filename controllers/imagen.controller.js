const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const response = require('express').response;
const dbConnection = require('../utils/dbConnection');


const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const username = req.query.username;
       
        const storagePath = path.join(__dirname, '../public', username, `${year}-${month}-${day}`);

        fs.mkdirSync(storagePath, { recursive: true });
        cb(null, storagePath);
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

const getImagen = async (req, res = response) => {
    try {
        const { id } = req.params;
        const [imagen] = await dbConnection.query(`SELECT * FROM imagenes WHERE id = ${id}`);

        if (!imagen) {
            return res.status(404).json({
                message: 'Imagen no encontrada'
            });
        }

        const imagePath = path.join(__dirname, '..', 'public', imagen.path);

        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const setImagen = async (req, res = response) => {
    try {
        upload.single('file')(req, res, async function (err) {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            const file = req.file;
            const fileId = file.filename;
            const fileUrl = `/${req.query.username}/${year}-${month}-${day}/${file.filename}`;

            const imagen = await dbConnection.query(
                `INSERT INTO imagenes (filename, path) VALUES ('${file.filename}', '${fileUrl}')`,
            );

            res.status(200).json({
                id: imagen,
                message: 'Archivo guardado exitosamente.',
                fileId: fileId,
                fileUrl: fileUrl
            });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    setImagen,
    getImagen
}
