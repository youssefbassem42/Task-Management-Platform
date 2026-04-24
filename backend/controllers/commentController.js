const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
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

  // Notify task assignees about the comment
  const assigneeIds = Array.isArray(req.task.assigneeIds) ? req.task.assigneeIds : [];
  const notifyIds = assigneeIds
    .map((id) => (id._id || id).toString())
    .filter((id) => id !== req.user._id.toString());

  await Promise.allSettled(
    notifyIds.map((assigneeId) =>
      Notification.create({
        userId: assigneeId,
        type: "TASK_COMMENTED",
        message: `${req.user.name} commented on "${req.task.title}"`,
        link: `/boards/${req.board._id}`,
        metadata: { boardId: req.board._id, taskId: req.task._id },
      })
    )
  );

  res.status(201).json(comment);
});

module.exports = {
  getTaskComments,
  addComment,
};

