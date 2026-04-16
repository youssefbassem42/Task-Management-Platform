const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getUsers, getUserById, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

module.exports = router;
