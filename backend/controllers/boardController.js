const Board = require("../models/Board");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const {
  requireNonEmptyString,
  normalizeIdArray,
  ensureObjectId,
} = require("../utils/validators");

const serializeBoard = (board, currentUserId) => ({
  _id: board._id,
  name: board.name,
  ownerId: board.ownerId,
  memberIds: board.memberIds,
  isOwner: board.ownerId.toString() === currentUserId.toString(),
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
});

const createBoard = asyncHandler(async (req, res) => {
  const name = requireNonEmptyString(req.body.name, "name", 120);
  const memberIds = normalizeIdArray(req.body.memberIds || [], "memberIds") || [];
  const sanitizedMemberIds = memberIds.filter((id) => id !== req.user._id.toString());

  if (sanitizedMemberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: sanitizedMemberIds } });
    if (memberCount !== sanitizedMemberIds.length) {
      throw createHttpError(400, "One or more board members do not exist");
    }
  }

  const board = await Board.create({
    name,
    ownerId: req.user._id,
    memberIds: sanitizedMemberIds,
  });

  res.status(201).json(serializeBoard(board, req.user._id));
});

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [{ ownerId: req.user._id }, { memberIds: req.user._id }],
  }).sort({ updatedAt: -1 });

  const boardIds = boards.map((board) => board._id);
  const taskCounts = await Task.aggregate([
    { $match: { boardId: { $in: boardIds }, isArchived: false } },
    {
      $group: {
        _id: "$boardId",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const countsMap = taskCounts.reduce((acc, item) => {
    acc[item._id.toString()] = {
      totalTasks: item.totalTasks,
      completedTasks: item.completedTasks,
    };
    return acc;
  }, {});

  res.json(
    boards.map((board) => ({
      ...serializeBoard(board, req.user._id),
      totalTasks: countsMap[board._id.toString()]?.totalTasks || 0,
      completedTasks: countsMap[board._id.toString()]?.completedTasks || 0,
    }))
  );
});

const getBoardById = asyncHandler(async (req, res) => {
  const memberIds = [...new Set([req.board.ownerId.toString(), ...req.board.memberIds.map(String)])];
  const members = await User.find({ _id: { $in: memberIds } }, "name email").sort({ name: 1 });

  res.json({
    board: serializeBoard(req.board, req.user._id),
    members,
  });
});

const updateBoardMembers = asyncHandler(async (req, res) => {
  const memberIds = normalizeIdArray(req.body.memberIds || [], "memberIds") || [];
  const sanitizedMemberIds = memberIds.filter((id) => id !== req.user._id.toString());

  if (sanitizedMemberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: sanitizedMemberIds } });
    if (memberCount !== sanitizedMemberIds.length) {
      throw createHttpError(400, "One or more board members do not exist");
    }
  }

  req.board.memberIds = sanitizedMemberIds;
  await req.board.save();

  const members = await User.find(
    { _id: { $in: [req.board.ownerId, ...req.board.memberIds] } },
    "name email"
  ).sort({ name: 1 });

  res.json({
    board: serializeBoard(req.board, req.user._id),
    members,
  });
});

const deleteBoard = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.boardId, "boardId");

  const boardTasks = await Task.find({ boardId: req.board._id }, "_id");
  const taskIds = boardTasks.map((task) => task._id);

  await Promise.all([
    Comment.deleteMany({ taskId: { $in: taskIds } }),
    Task.deleteMany({ boardId: req.board._id }),
    req.board.deleteOne(),
  ]);

  res.json({ message: "Board deleted successfully" });
});

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoardMembers,
  deleteBoard,
};
