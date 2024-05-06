const { Router } = require("express");

const {
    getSpecificUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/user.controller");
const { validateJWT } = require("../middleware/session");

const router = Router();

router.post("/", createUser);

router.get("/", validateJWT, getAllUsers);

router.get("/:id",validateJWT, getSpecificUser);

router.put("/:id",validateJWT, updateUser);

router.delete("/:id",validateJWT, deleteUser);

module.exports = router;