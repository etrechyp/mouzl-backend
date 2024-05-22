const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    setRepartidor,
    getRepartidor
} = require("../controllers/repartidor.controller")

const router = Router();

// router.post("/", setRepartidor);

router.get("/:id", getRepartidor)

module.exports = router;