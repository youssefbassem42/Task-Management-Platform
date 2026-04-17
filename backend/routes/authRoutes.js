const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateProfileAvatar,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { imageUpload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPasswordWithToken);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, imageUpload.single("avatar"), updateProfileAvatar);

module.exports = router;
