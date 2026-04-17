const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { requireNonEmptyString } = require("../utils/validators");
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
  const name = requireNonEmptyString(req.body.name, "name", 80);
  const email = requireNonEmptyString(req.body.email, "email", 160).toLowerCase();
  const password = requireNonEmptyString(req.body.password, "password", 200);

  if (password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
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
  const email = requireNonEmptyString(req.body.email, "email", 160).toLowerCase();

  const user = await User.findOne({ email });
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
  const email = requireNonEmptyString(req.body.email, "email", 160).toLowerCase();
  
  const user = await User.findOne({ email });
  if (!user) {
    // Return a succcess message to prevent email enumeration attacks
    return res.json({ message: "If that email exists in our system, a password reset link has been sent." });
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

  res.json({ message: "If that email exists in our system, a password reset link has been sent." });
});

const resetPasswordWithToken = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token;
  const password = requireNonEmptyString(req.body.password, "password", 200);

  if (password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters");
  }

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
  const email = requireNonEmptyString(req.body.email, "email", 160).toLowerCase();
  const password = requireNonEmptyString(req.body.password, "password", 200);

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
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
    user.name = requireNonEmptyString(req.body.name, "name", 80);
  }

  if (req.body.email !== undefined) {
    const email = requireNonEmptyString(req.body.email, "email", 160).toLowerCase();
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      throw createHttpError(409, "Email is already in use");
    }

    user.email = email;
  }

  if (req.body.password !== undefined && req.body.password !== "") {
    const password = requireNonEmptyString(req.body.password, "password", 200);
    if (password.length < 6) {
      throw createHttpError(400, "Password must be at least 6 characters");
    }

    user.password = await bcrypt.hash(password, 10);
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateProfileAvatar,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken
};
