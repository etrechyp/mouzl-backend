const { Router } = require("express");
const { login, logout, renewToken } = require("../controllers/auth.controller");
const { validateJWT } = require("../middleware/session");

const router = Router();

router.post("/login", login);

router.post("/logout", validateJWT, logout)

router.post("/", validateJWT, renewToken); 

module.exports = router;