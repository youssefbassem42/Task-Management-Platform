const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getUsers, getUserById, getMembers, getSharedProfile, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/members", getMembers);
router.get("/:id", getUserById);
router.get("/:id/shared", getSharedProfile);
router.delete("/:id", deleteUser);

module.exports = router;
