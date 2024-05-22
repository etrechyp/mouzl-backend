const { Router } = require("express");
const { validateJWT } = require("../middleware/session");
const {
    setReceptor,
    getReceptor
} = require("../controllers/receptor.controller")

const router = Router();

// router.post("/", setReceptor);

router.get("/:id", getReceptor)

module.exports = router;