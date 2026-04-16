const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateProfileAvatar,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { imageUpload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, imageUpload.single("avatar"), updateProfileAvatar);

module.exports = router;
