const { Router } = require("express");
const { login, renewToken } = require("../controllers/auth.controller");
const { validateJWT } = require("../middleware/session");

const router = Router();

router.post("/login", login);

router.post("/", validateJWT, renewToken); 

module.exports = router;