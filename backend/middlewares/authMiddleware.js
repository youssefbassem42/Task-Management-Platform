const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Board = require("../models/Board");
const Task = require("../models/Task");
const { asyncHandler, createHttpError } = require("../utils/http");
const { ensureObjectId } = require("../utils/validators");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw createHttpError(401, "User not found");
  }

  req.user = user;
  next();
});

const userCanAccessBoard = (board, userId) => {
  const normalizedUserId = userId.toString();

  return (
    board.ownerId.toString() === normalizedUserId ||
    board.memberIds.some((memberId) => memberId.toString() === normalizedUserId)
  );
};

const loadBoard = asyncHandler(async (req, res, next) => {
  ensureObjectId(req.params.boardId, "boardId");

  const board = await Board.findById(req.params.boardId);
  if (!board) {
    throw createHttpError(404, "Board not found");
  }

  req.board = board;
  next();
});

const requireBoardAccess = asyncHandler(async (req, res, next) => {
  if (!userCanAccessBoard(req.board, req.user._id)) {
    throw createHttpError(403, "You do not have access to this board");
  }

  next();
});

const requireBoardOwner = asyncHandler(async (req, res, next) => {
  if (req.board.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(403, "Only the board owner can perform this action");
  }

  next();
});

const loadTask = asyncHandler(async (req, res, next) => {
  ensureObjectId(req.params.taskId, "taskId");

  const task = await Task.findOne({
    _id: req.params.taskId,
    boardId: req.params.boardId,
  }).populate("assigneeId", "name email");

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  req.task = task;
  next();
});

module.exports = {
  protect,
  loadBoard,
  requireBoardAccess,
  requireBoardOwner,
  loadTask,
  userCanAccessBoard,
};
