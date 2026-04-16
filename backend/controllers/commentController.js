const Comment = require("../models/Comment");
const { logBoardActivity } = require("../utils/activity");
const { asyncHandler } = require("../utils/http");
const { requireNonEmptyString } = require("../utils/validators");

const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ taskId: req.task._id })
    .populate("userId", "name email avatar")
    .sort({ createdAt: 1 });

  res.json(comments);
});

const addComment = asyncHandler(async (req, res) => {
  const content = requireNonEmptyString(req.body.content, "content", 1000);

  const comment = await Comment.create({
    taskId: req.task._id,
    userId: req.user._id,
    content,
  });

  await comment.populate("userId", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `commented on "${req.task.title}"`,
    entity: "comment",
  });
  res.status(201).json(comment);
});

module.exports = {
  getTaskComments,
  addComment,
};
