const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");

const { buildFileUrl } = require("../utils/files");
const { sendAccountVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const serializeAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  token: generateToken(user._id),
});

const registerUser = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const emailLower = email.toLowerCase();

  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    throw createHttpError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email: emailLower,
    password: hashedPassword,
    isVerified: false,
    verificationToken,
  });

  // Try to send email but don't fail registration if mail transport fails
  try {
    await sendAccountVerificationEmail(user.email, verificationToken);
  } catch(e) {
    console.error("Failed to send verification email during registration", e);
  }

  res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.params.token;
  if (!token) {
    throw createHttpError(400, "Invalid or missing token");
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw createHttpError(400, "Invalid or expired verification link");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ message: "Account successfully verified. You can now log in." });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const emailLower = req.body.email.trim().toLowerCase();

  const user = await User.findOne({ email: emailLower });
  if (!user) {
    // Hide true existence
    return res.json({ message: "If your email is registered and unverified, a new link has been sent." });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Account is already verified. You can log in." });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  try {
    await sendAccountVerificationEmail(user.email, verificationToken);
  } catch(e) {
    console.error("Failed to resend verification email", e);
  }

  res.json({ message: "If your email is registered and unverified, a new link has been sent." });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const emailLower = req.body.email.trim().toLowerCase();
  
  const user = await User.findOne({ email: emailLower });
  if (!user) {
    // Return a succcess message to prevent email enumeration attacks
    return res.json({ message: "A password reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch(e) {
    console.error("Failed to send reset password email", e);
  }

  res.json({ message: "A password reset link has been sent." });
});

const resetPasswordWithToken = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token;
  const password = req.body.password.trim();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw createHttpError(400, "Invalid or expired reset token");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
});

const loginUser = asyncHandler(async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const emailLower = email.toLowerCase();

  const user = await User.findOne({ email: emailLower });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (!user.password) {
    throw createHttpError(401, "Please log in using your OAuth provider (Google/GitHub)");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    throw createHttpError(403, "Please verify your email address to log in.");
  }

  res.json(serializeAuthUser(user));
});

const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar || "",
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (req.body.name !== undefined) {
    user.name = req.body.name;
  }

  if (req.body.email !== undefined) {
    const emailLower = req.body.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower, _id: { $ne: user._id } });
    if (existingUser) {
      throw createHttpError(409, "Email is already in use");
    }

    user.email = emailLower;
  }

  if (req.body.newPassword !== undefined && req.body.newPassword !== "") {
    const newPassword = req.body.newPassword.trim();
    const currentPassword = req.body.currentPassword.trim();

    if (!user.password) {
      throw createHttpError(400, "Your account was created via Google/GitHub and does not have a password. Please use OAuth to log in.");
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw createHttpError(401, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json(serializeAuthUser(user));
});

const updateProfileAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Avatar image is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  user.avatar = buildFileUrl(req, req.file.filename);
  await user.save();

  res.json(serializeAuthUser(user));
});

const generateTokenAndRedirect = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`);
    }

    const token = generateToken(req.user._id);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=ServerError`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateProfileAvatar,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken,
  generateTokenAndRedirect
};
