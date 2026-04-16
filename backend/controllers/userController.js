const Board = require("../models/Board");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { ensureObjectId } = require("../utils/validators");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "name email").sort({ name: 1 });
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "userId");

  const user = await User.findById(req.params.id, "name email");
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "userId");

  if (req.user._id.toString() !== req.params.id) {
    throw createHttpError(403, "You can only delete your own account");
  }

  const ownedBoards = await Board.countDocuments({ ownerId: req.user._id });
  if (ownedBoards > 0) {
    throw createHttpError(400, "Delete or transfer owned boards before deleting this user");
  }

  await Promise.all([
    Task.updateMany({ assigneeId: req.user._id }, { $set: { assigneeId: null } }),
    Board.updateMany({ memberIds: req.user._id }, { $pull: { memberIds: req.user._id } }),
    User.findByIdAndDelete(req.user._id),
  ]);

  res.json({ message: "User deleted successfully" });
});

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
};
