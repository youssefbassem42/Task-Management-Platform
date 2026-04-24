const Board = require("../models/Board");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { ensureObjectId } = require("../utils/validators");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "name email avatar").sort({ name: 1 });
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "userId");

  const user = await User.findById(req.params.id, "name email avatar");
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  res.json(user);
});

/**
 * GET /api/users/members
 * Returns all users who share at least one board with the current user.
 * For each user, includes the list of shared board names.
 */
const getMembers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all boards the current user belongs to
  const userBoards = await Board.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  });

  // Collect all member IDs across all boards
  const memberBoardsMap = {}; // userId -> [boardName, ...]

  userBoards.forEach((board) => {
    const allBoardUsers = [
      board.ownerId.toString(),
      ...board.memberIds.map((id) => id.toString()),
    ];

    allBoardUsers.forEach((memberId) => {
      if (memberId === userId.toString()) return;

      if (!memberBoardsMap[memberId]) {
        memberBoardsMap[memberId] = [];
      }
      memberBoardsMap[memberId].push(board.name);
    });
  });

  const memberIds = Object.keys(memberBoardsMap);

  if (memberIds.length === 0) {
    return res.json([]);
  }

  const users = await User.find(
    { _id: { $in: memberIds } },
    "name email avatar"
  ).sort({ name: 1 });

  const result = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    sharedBoards: memberBoardsMap[user._id.toString()] || [],
  }));

  res.json(result);
});

/**
 * GET /api/users/:id/shared
 * Returns shared boards and shared tasks between current user and target user.
 */
const getSharedProfile = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "userId");
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  const targetUser = await User.findById(targetUserId, "name email avatar");
  if (!targetUser) {
    throw createHttpError(404, "User not found");
  }

  // Find boards where both users are members/owners
  const allBoards = await Board.find({
    $or: [{ ownerId: currentUserId }, { memberIds: currentUserId }],
  });

  const sharedBoards = allBoards.filter((board) => {
    const isTargetOwner = board.ownerId.toString() === targetUserId;
    const isTargetMember = board.memberIds.some(
      (id) => id.toString() === targetUserId
    );
    return isTargetOwner || isTargetMember;
  });

  const sharedBoardIds = sharedBoards.map((b) => b._id);

  // Find tasks in shared boards where both users are assigned
  const sharedTasks = await Task.find({
    boardId: { $in: sharedBoardIds },
    isArchived: false,
    $or: [
      { assigneeId: { $in: [currentUserId, targetUserId] } },
      { assigneeIds: { $in: [currentUserId, targetUserId] } },
    ],
  })
    .populate("boardId", "name")
    .populate("assigneeId", "name email avatar")
    .populate("assigneeIds", "name email avatar")
    .sort({ updatedAt: -1 })
    .limit(50);

  res.json({
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      avatar: targetUser.avatar || "",
    },
    sharedBoards: sharedBoards.map((b) => ({
      _id: b._id,
      name: b.name,
      description: b.description || "",
    })),
    sharedTasks,
  });
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
  getMembers,
  getSharedProfile,
  deleteUser,
};
