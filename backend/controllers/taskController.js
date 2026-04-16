const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const {
  requireNonEmptyString,
  optionalTrimmedString,
  ensureEnum,
  ensureObjectId,
} = require("../utils/validators");

const STATUS_VALUES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"];

const canEditTaskStatus = (task, board, userId) => {
  const normalizedUserId = userId.toString();
  return (
    board.ownerId.toString() === normalizedUserId ||
    (task.assigneeId && task.assigneeId._id.toString() === normalizedUserId)
  );
};

const serializeTask = (task, boardOwnerId, currentUserId) => {
  const taskObject = task.toObject ? task.toObject() : task;
  const dueDate = taskObject.dueDate ? new Date(taskObject.dueDate) : null;
  const isOverdue = Boolean(
    dueDate &&
      taskObject.status !== "DONE" &&
      !taskObject.isArchived &&
      dueDate.getTime() < Date.now()
  );

  return {
    ...taskObject,
    isOverdue,
    canManage: boardOwnerId.toString() === currentUserId.toString(),
    canChangeStatus:
      boardOwnerId.toString() === currentUserId.toString() ||
      (taskObject.assigneeId &&
        (taskObject.assigneeId._id || taskObject.assigneeId).toString() === currentUserId.toString()),
  };
};

const ensureAssigneeOnBoard = async (board, assigneeId) => {
  if (!assigneeId) {
    return null;
  }

  ensureObjectId(assigneeId, "assigneeId");

  const user = await User.findById(assigneeId, "name email");
  if (!user) {
    throw createHttpError(400, "Assignee does not exist");
  }

  const isAllowed =
    board.ownerId.toString() === assigneeId ||
    board.memberIds.some((memberId) => memberId.toString() === assigneeId);

  if (!isAllowed) {
    throw createHttpError(400, "Assignee must be a board member or the board owner");
  }

  return assigneeId;
};

const getTasks = asyncHandler(async (req, res) => {
  const filters = {
    boardId: req.board._id,
    isArchived: req.query.archived === "true",
  };

  if (req.query.status) {
    filters.status = ensureEnum(req.query.status, STATUS_VALUES, "status");
  }

  if (req.query.mine === "true") {
    filters.assigneeId = req.user._id;
  }

  if (req.query.q) {
    filters.title = { $regex: req.query.q.trim(), $options: "i" };
  }

  const tasks = await Task.find(filters)
    .populate("assigneeId", "name email")
    .sort({ createdAt: -1 });

  res.json(tasks.map((task) => serializeTask(task, req.board.ownerId, req.user._id)));
});

const getTaskById = asyncHandler(async (req, res) => {
  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const createTask = asyncHandler(async (req, res) => {
  const title = requireNonEmptyString(req.body.title, "title", 120);
  const description = optionalTrimmedString(req.body.description, 2000);
  const status = req.body.status ? ensureEnum(req.body.status, STATUS_VALUES, "status") : "TODO";
  const priority = req.body.priority
    ? ensureEnum(req.body.priority, PRIORITY_VALUES, "priority")
    : "MEDIUM";
  const assigneeId = await ensureAssigneeOnBoard(req.board, req.body.assigneeId || null);
  const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

  if (req.body.dueDate && Number.isNaN(dueDate.getTime())) {
    throw createHttpError(400, "dueDate is invalid");
  }

  const task = await Task.create({
    boardId: req.board._id,
    title,
    description,
    status,
    priority,
    assigneeId,
    dueDate,
  });

  await task.populate("assigneeId", "name email");
  res.status(201).json(serializeTask(task, req.board.ownerId, req.user._id));
});

const updateTask = asyncHandler(async (req, res) => {
  if (req.body.title !== undefined) {
    req.task.title = requireNonEmptyString(req.body.title, "title", 120);
  }

  if (req.body.description !== undefined) {
    req.task.description = optionalTrimmedString(req.body.description, 2000);
  }

  if (req.body.priority !== undefined) {
    req.task.priority = ensureEnum(req.body.priority, PRIORITY_VALUES, "priority");
  }

  if (req.body.assigneeId !== undefined) {
    req.task.assigneeId = await ensureAssigneeOnBoard(req.board, req.body.assigneeId || null);
  }

  if (req.body.dueDate !== undefined) {
    if (!req.body.dueDate) {
      req.task.dueDate = null;
    } else {
      const dueDate = new Date(req.body.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw createHttpError(400, "dueDate is invalid");
      }

      req.task.dueDate = dueDate;
    }
  }

  if (req.body.status !== undefined) {
    req.task.status = ensureEnum(req.body.status, STATUS_VALUES, "status");
  }

  await req.task.save();
  await req.task.populate("assigneeId", "name email");

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const status = ensureEnum(req.body.status, STATUS_VALUES, "status");

  if (!canEditTaskStatus(req.task, req.board, req.user._id)) {
    throw createHttpError(403, "Only the assignee or board owner can change task status");
  }

  req.task.status = status;
  await req.task.save();

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const archiveTask = asyncHandler(async (req, res) => {
  req.task.isArchived = req.body.isArchived !== undefined ? Boolean(req.body.isArchived) : true;
  await req.task.save();

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const deleteTask = asyncHandler(async (req, res) => {
  await Promise.all([
    Comment.deleteMany({ taskId: req.task._id }),
    req.task.deleteOne(),
  ]);

  res.json({ message: "Task deleted successfully" });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  archiveTask,
  deleteTask,
};
