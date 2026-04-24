const Board = require("../models/Board");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");

/**
 * GET /api/search?q=keyword
 * Searches users (from mutual boards), tasks, and subtasks by keyword.
 */
const globalSearch = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query || query.length < 2) {
    return res.json({ users: [], tasks: [] });
  }

  const userId = req.user._id;
  const regex = new RegExp(query, "i");

  // Find boards user belongs to
  const userBoards = await Board.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  });

  const boardIds = userBoards.map((b) => b._id);

  // Collect all mutual member IDs
  const memberIdSet = new Set();
  userBoards.forEach((board) => {
    memberIdSet.add(board.ownerId.toString());
    board.memberIds.forEach((id) => memberIdSet.add(id.toString()));
  });
  memberIdSet.delete(userId.toString());

  // Search users by name/email among mutual members
  const memberIdsArr = Array.from(memberIdSet);
  const users = await User.find(
    {
      _id: { $in: memberIdsArr },
      $or: [{ name: regex }, { email: regex }],
    },
    "name email avatar"
  )
    .sort({ name: 1 })
    .limit(10);

  // Search tasks by title, description, keywords, or checklist text
  const tasks = await Task.find({
    boardId: { $in: boardIds },
    isArchived: false,
    $or: [
      { title: regex },
      { description: regex },
      { keywords: regex },
      { "checklist.text": regex },
    ],
  })
    .populate("boardId", "name")
    .populate("assigneeId", "name email avatar")
    .sort({ updatedAt: -1 })
    .limit(15);

  res.json({ users, tasks });
});

module.exports = { globalSearch };
