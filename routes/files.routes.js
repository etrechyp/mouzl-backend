const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    setFile,
    getFile
} = require("../controllers/files.controller")

const router = Router();

router.post("/", setFile);

router.get("/:id", getFile)

module.exports = router;