const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    getAllEntregas,
    getSpecificEntrega,
    updateEntrega,
    createEntrega
} = require('../controllers/entregas.controller')

const router = Router();

router.get("/:id", validateJWT, getSpecificEntrega);

router.get("/", validateJWT, getAllEntregas);

router.put("/:id", validateJWT, updateEntrega)

router.post("/", validateJWT, createEntrega)

module.exports = router;