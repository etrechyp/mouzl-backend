const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    setImagen,
    getImagen
} = require("../controllers/imagen.controller")

const router = Router();

router.post("/", validateJWT, setImagen);

router.get("/:id", getImagen)

module.exports = router;