const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { requireNonEmptyString } = require("../utils/validators");
const { buildFileUrl } = require("../utils/files");

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
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json(serializeAuthUser(user));
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

  if (req.body.password !== undefined) {
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
};
