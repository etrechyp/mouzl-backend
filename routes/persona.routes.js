const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    setPersona,
    getAllPersonas,
    getPersona,
    updatePersona,
    deletePersona
} = require("../controllers/persona.controller")

const router = Router();

router.get("/", validateJWT, getAllPersonas);

router.post("/", setPersona);

router.get("/:id", validateJWT, getPersona)

router.put("/:id", validateJWT, updatePersona)

router.delete("/:id", validateJWT, deletePersona)


module.exports = router;