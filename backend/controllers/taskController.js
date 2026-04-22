const Comment = require("../models/Comment");
const FileAttachment = require("../models/FileAttachment");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { logBoardActivity } = require("../utils/activity");
const { deleteStoredFile } = require("../utils/files");
const {
  requireNonEmptyString,
  optionalTrimmedString,
  ensureEnum,
  ensureObjectId,
} = require("../utils/validators");
const { sendTaskAssignedEmail } = require("../utils/email");

const STATUS_VALUES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeKeywords = (keywords = []) =>
  Array.from(
    new Set(
      (Array.isArray(keywords) ? keywords : [])
        .map((keyword) => String(keyword || "").trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20)
    )
  );

const normalizeChecklist = (checklist = []) =>
  (Array.isArray(checklist) ? checklist : [])
    .map((item) => ({
      text: requireNonEmptyString(item?.text, "checklist.text", 240),
      completed: Boolean(item?.completed),
    }))
    .slice(0, 100);

const parseOptionalDate = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} is invalid`);
  }

  return date;
};

const canEditTaskStatus = (task, board, userId) => {
  const normalizedUserId = userId.toString();
  return (
    board.ownerId.toString() === normalizedUserId ||
    (Array.isArray(task.assigneeIds) &&
      task.assigneeIds.some((assignee) => (assignee._id || assignee).toString() === normalizedUserId)) ||
    (task.assigneeId && (task.assigneeId._id || task.assigneeId).toString() === normalizedUserId)
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
  const assigneeIds = Array.isArray(taskObject.assigneeIds)
    ? taskObject.assigneeIds
    : taskObject.assigneeId
      ? [taskObject.assigneeId]
      : [];
  const checklist = Array.isArray(taskObject.checklist) ? taskObject.checklist : [];
  const completedChecklistCount = checklist.filter((item) => item.completed).length;

  return {
    ...taskObject,
    assigneeIds,
    assigneeId: assigneeIds[0] || taskObject.assigneeId || null,
    checklist,
    completedChecklistCount,
    totalChecklistCount: checklist.length,
    keywords: Array.isArray(taskObject.keywords) ? taskObject.keywords : [],
    isOverdue,
    canManage: boardOwnerId.toString() === currentUserId.toString(),
    canChangeStatus:
      boardOwnerId.toString() === currentUserId.toString() ||
      assigneeIds.some((assignee) => (assignee._id || assignee).toString() === currentUserId.toString()),
  };
};

const ensureAssigneesOnBoard = async (board, assigneeInput) => {
  const rawAssigneeIds = Array.isArray(assigneeInput)
    ? assigneeInput
    : assigneeInput
      ? [assigneeInput]
      : [];

  const uniqueAssigneeIds = Array.from(new Set(rawAssigneeIds.map((id) => String(id))));

  if (!uniqueAssigneeIds.length) {
    return [];
  }

  uniqueAssigneeIds.forEach((assigneeId) => ensureObjectId(assigneeId, "assigneeIds"));

  const users = await User.find({ _id: { $in: uniqueAssigneeIds } }, "name email");
  if (users.length !== uniqueAssigneeIds.length) {
    throw createHttpError(400, "One or more assignees do not exist");
  }

  uniqueAssigneeIds.forEach((assigneeId) => {
    const isAllowed =
      board.ownerId.toString() === assigneeId ||
      board.memberIds.some((memberId) => memberId.toString() === assigneeId);

    if (!isAllowed) {
      throw createHttpError(400, "Assignees must be board members or the board owner");
    }
  });

  return uniqueAssigneeIds;
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
    filters.assigneeIds = req.user._id;
  }

  if (req.query.assigneeId && req.query.mine !== "true") {
    ensureObjectId(req.query.assigneeId, "assigneeId");
    filters.assigneeIds = req.query.assigneeId;
  }

  if (req.query.priority) {
    filters.priority = ensureEnum(req.query.priority, PRIORITY_VALUES, "priority");
  }

  if (req.query.dueWindow) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    if (req.query.dueWindow === "overdue") {
      filters.dueDate = { $lt: startOfToday };
      filters.status = { $ne: "DONE" };
    } else if (req.query.dueWindow === "today") {
      filters.dueDate = { $gte: startOfToday, $lt: endOfToday };
    } else if (req.query.dueWindow === "this_week") {
      filters.dueDate = { $gte: startOfToday, $lt: endOfWeek };
    } else if (req.query.dueWindow === "no_due_date") {
      filters.dueDate = null;
    }
  }

  if (req.query.q) {
    const query = req.query.q.trim();
    if (query) {
      const pattern = new RegExp(escapeRegex(query), "i");
      filters.$or = [{ title: pattern }, { description: pattern }, { keywords: pattern }];
    }
  }

  const tasks = await Task.find(filters)
    .populate("assigneeId", "name email avatar")
    .populate("assigneeIds", "name email avatar")
    .sort({ createdAt: -1 });

  res.json(tasks.map((task) => serializeTask(task, req.board.ownerId, req.user._id)));
});

const getTaskById = asyncHandler(async (req, res) => {
  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const createTask = asyncHandler(async (req, res) => {
  const title = requireNonEmptyString(req.body.title, "title", 120);
  const description = optionalTrimmedString(req.body.description, 8000);
  const emoji = optionalTrimmedString(req.body.emoji, 16);
  const status = req.body.status ? ensureEnum(req.body.status, STATUS_VALUES, "status") : "TODO";
  const priority = req.body.priority
    ? ensureEnum(req.body.priority, PRIORITY_VALUES, "priority")
    : "MEDIUM";
  const assigneeIds = await ensureAssigneesOnBoard(
    req.board,
    req.body.assigneeIds !== undefined ? req.body.assigneeIds : req.body.assigneeId || null
  );
  const startDate = parseOptionalDate(req.body.startDate, "startDate");
  const dueDate = parseOptionalDate(req.body.dueDate, "dueDate");
  const keywords = normalizeKeywords(req.body.keywords);
  const checklist = normalizeChecklist(req.body.checklist);

  if (startDate && dueDate && startDate > dueDate) {
    throw createHttpError(400, "startDate cannot be after dueDate");
  }

  const task = await Task.create({
    boardId: req.board._id,
    title,
    description,
    emoji,
    status,
    priority,
    assigneeId: assigneeIds[0] || null,
    assigneeIds,
    keywords,
    checklist,
    startDate,
    dueDate,
  });

  await task.populate("assigneeId", "name email avatar");
  await task.populate("assigneeIds", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `created task "${task.title}"`,
    entity: "task",
  });

  await Promise.allSettled(
    (task.assigneeIds || [])
      .filter((assignee) => assignee._id.toString() !== req.user._id.toString())
      .map((assignee) => sendTaskAssignedEmail(assignee.email, task, req.board.name))
  );

  res.status(201).json(serializeTask(task, req.board.ownerId, req.user._id));
});

const updateTask = asyncHandler(async (req, res) => {
  const previousStatus = req.task.status;
  const originalTitle = req.task.title;

  if (req.body.title !== undefined) {
    req.task.title = requireNonEmptyString(req.body.title, "title", 120);
  }

  if (req.body.description !== undefined) {
    req.task.description = optionalTrimmedString(req.body.description, 8000);
  }

  if (req.body.emoji !== undefined) {
    req.task.emoji = optionalTrimmedString(req.body.emoji, 16);
  }

  if (req.body.priority !== undefined) {
    req.task.priority = ensureEnum(req.body.priority, PRIORITY_VALUES, "priority");
  }

  if (req.body.assigneeId !== undefined || req.body.assigneeIds !== undefined) {
    const assigneeIds = await ensureAssigneesOnBoard(
      req.board,
      req.body.assigneeIds !== undefined ? req.body.assigneeIds : req.body.assigneeId || null
    );
    req.task.assigneeIds = assigneeIds;
    req.task.assigneeId = assigneeIds[0] || null;
  }

  if (req.body.keywords !== undefined) {
    req.task.keywords = normalizeKeywords(req.body.keywords);
  }

  if (req.body.checklist !== undefined) {
    req.task.checklist = normalizeChecklist(req.body.checklist);
  }

  if (req.body.startDate !== undefined) {
    req.task.startDate = parseOptionalDate(req.body.startDate, "startDate");
  }

  if (req.body.dueDate !== undefined) {
    req.task.dueDate = parseOptionalDate(req.body.dueDate, "dueDate");
  }

  if (req.task.startDate && req.task.dueDate && req.task.startDate > req.task.dueDate) {
    throw createHttpError(400, "startDate cannot be after dueDate");
  }

  if (req.body.status !== undefined) {
    req.task.status = ensureEnum(req.body.status, STATUS_VALUES, "status");
  }

  await req.task.save();
  await req.task.populate("assigneeId", "name email avatar");
  await req.task.populate("assigneeIds", "name email avatar");

  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `updated task "${req.task.title}"`,
    entity: "task",
  });

  if (previousStatus !== req.task.status) {
    await logBoardActivity({
      boardId: req.board._id,
      userId: req.user._id,
      action: `changed "${req.task.title || originalTitle}" status to ${req.task.status}`,
      entity: "task",
    });
  }

  if (req.body.assigneeId !== undefined || req.body.assigneeIds !== undefined) {
    await Promise.allSettled(
      (req.task.assigneeIds || [])
        .filter((assignee) => assignee._id.toString() !== req.user._id.toString())
        .map((assignee) => sendTaskAssignedEmail(assignee.email, req.task, req.board.name))
    );
  }

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const status = ensureEnum(req.body.status, STATUS_VALUES, "status");

  if (!canEditTaskStatus(req.task, req.board, req.user._id)) {
    throw createHttpError(403, "Only the assignee or board owner can change task status");
  }

  req.task.status = status;
  await req.task.save();
  await req.task.populate("assigneeId", "name email avatar");
  await req.task.populate("assigneeIds", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `changed "${req.task.title}" status to ${status}`,
    entity: "task",
  });

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const archiveTask = asyncHandler(async (req, res) => {
  req.task.isArchived = req.body.isArchived !== undefined ? Boolean(req.body.isArchived) : true;
  await req.task.save();
  await req.task.populate("assigneeId", "name email avatar");
  await req.task.populate("assigneeIds", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `${req.task.isArchived ? "archived" : "restored"} task "${req.task.title}"`,
    entity: "task",
  });

  res.json(serializeTask(req.task, req.board.ownerId, req.user._id));
});

const deleteTask = asyncHandler(async (req, res) => {
  const attachments = await FileAttachment.find({ taskId: req.task._id }, "fileUrl");

  await Promise.all([
    Comment.deleteMany({ taskId: req.task._id }),
    FileAttachment.deleteMany({ taskId: req.task._id }),
    req.task.deleteOne(),
  ]);

  await Promise.allSettled(attachments.map((attachment) => deleteStoredFile(attachment.fileUrl)));

  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `deleted task "${req.task.title}"`,
    entity: "task",
  });

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
