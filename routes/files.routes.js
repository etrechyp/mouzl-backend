const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    getFile,
    setFile
} = require("../controllers/files.controller")

const router = Router();

router.get("/:id", validateJWT, getFile);

router.post("/", validateJWT, setFile);

module.exports = router;