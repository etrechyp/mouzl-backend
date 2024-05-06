const express = require("express");
const cors = require("cors");

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.paths = {
            users: "/api/user",
            auth: "/api/auth"
        };

        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors({
            credentials: false,
        }));
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.paths.auth, require("../routes/auth.routes"));
        this.app.use(this.paths.users, require("../routes/user.routes"));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server run in port ${this.port}`);
        });
    }
}

module.exports = Server;