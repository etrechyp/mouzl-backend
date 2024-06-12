const express = require("express");
const cors = require("cors");
require('../utils/cleanup');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.paths = {
            usuario: "/api/usuario",
            auth: "/api/auth",
            entregas: "/api/entrega",
            imagen: "/api/imagen",
            persona: "/api/persona"
        };

        this.middlewares();
        this.routes();
        this.staticFiles();
    }

    middlewares() {
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: false
        }));
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.paths.auth, require("../routes/auth.routes"));
        this.app.use(this.paths.usuario, require("../routes/user.routes"));
        this.app.use(this.paths.entregas, require("../routes/entregas.routes"))
        this.app.use(this.paths.imagen, require("../routes/imagen.routes"))
        this.app.use(this.paths.persona, require("../routes/persona.routes"))
    }

    staticFiles() {
        this.app.use(express.static('public'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server run in port ${this.port}`);
            
            //TODO: cerrar todas las sesiones cuando arranque el server
        });
    }
}

module.exports = Server;
