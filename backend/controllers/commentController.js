const Comment = require("../models/Comment");
const { logBoardActivity } = require("../utils/activity");
const { asyncHandler, createHttpError } = require("../utils/http");
const { requireNonEmptyString } = require("../utils/validators");

const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ taskId: req.task._id })
    .populate("userId", "name email avatar")
    .populate("parentCommentId", "_id")
    .sort({ createdAt: 1 });

  res.json(comments);
});

const addComment = asyncHandler(async (req, res) => {
  const content = requireNonEmptyString(req.body.content, "content", 4000);
  let parentCommentId = null;

  if (req.body.parentCommentId) {
    parentCommentId = req.body.parentCommentId;
    const parentComment = await Comment.findOne({
      _id: parentCommentId,
      taskId: req.task._id,
    });

    if (!parentComment) {
      throw createHttpError(400, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    taskId: req.task._id,
    userId: req.user._id,
    content,
    parentCommentId,
  });

  await comment.populate("userId", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `${parentCommentId ? "replied to a comment on" : "commented on"} "${req.task.title}"`,
    entity: "comment",
  });
  res.status(201).json(comment);
});

module.exports = {
  getTaskComments,
  addComment,
};
