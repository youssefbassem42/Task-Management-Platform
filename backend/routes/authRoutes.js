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
const validateRequest = require("../middlewares/validateRequest");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resendVerificationSchema,
  resetPasswordSchema
} = require("../utils/validations");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", validateRequest(resendVerificationSchema), resendVerificationEmail);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), requestPasswordReset);
router.post("/reset-password/:token", validateRequest(resetPasswordSchema), resetPasswordWithToken);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, validateRequest(updateProfileSchema), updateProfile);
router.post("/profile/avatar", protect, imageUpload.single("avatar"), updateProfileAvatar);

module.exports = router;
