const excelJS = require("exceljs");
const Board = require("../models/Board");
const Comment = require("../models/Comment");
const FileAttachment = require("../models/FileAttachment");
const Activity = require("../models/Activity");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler, createHttpError } = require("../utils/http");
const { logBoardActivity } = require("../utils/activity");
const { requireNonEmptyString, normalizeIdArray, ensureObjectId } = require("../utils/validators");

const createInviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const generateUniqueInviteCode = async () => {
  let inviteCode = createInviteCode();
  let exists = await Board.exists({ inviteCode });

  while (exists) {
    inviteCode = createInviteCode();
    exists = await Board.exists({ inviteCode });
  }

  return inviteCode;
};

const ensureBoardInviteCode = async (board) => {
  if (board.inviteCode) {
    return board;
  }

  board.inviteCode = await generateUniqueInviteCode();
  await board.save();
  return board;
};

const serializeBoard = (board, currentUserId) => ({
  _id: board._id,
  name: board.name,
  ownerId: board.ownerId,
  memberIds: board.memberIds,
  inviteCode: board.inviteCode,
  isOwner: board.ownerId.toString() === currentUserId.toString(),
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
});

const validateMemberIds = async (memberIds, currentUserId) => {
  const normalizedMemberIds = normalizeIdArray(memberIds || [], "memberIds") || [];
  const sanitizedMemberIds = normalizedMemberIds.filter((id) => id !== currentUserId.toString());

  if (sanitizedMemberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: sanitizedMemberIds } });
    if (memberCount !== sanitizedMemberIds.length) {
      throw createHttpError(400, "One or more board members do not exist");
    }
  }

  return sanitizedMemberIds;
};

const getBoardMembers = (boardId, ownerId, memberIds) =>
  User.find({ _id: { $in: [ownerId, ...memberIds] } }, "name email avatar").sort({ name: 1 });

const createBoard = asyncHandler(async (req, res) => {
  const name = requireNonEmptyString(req.body.name, "name", 120);
  const memberIds = await validateMemberIds(req.body.memberIds || [], req.user._id);
  const inviteCode = await generateUniqueInviteCode();

  const board = await Board.create({
    name,
    ownerId: req.user._id,
    memberIds,
    inviteCode,
  });

  res.status(201).json(serializeBoard(board, req.user._id));
});

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [{ ownerId: req.user._id }, { memberIds: req.user._id }],
  }).sort({ updatedAt: -1 });
  await Promise.all(boards.map((board) => ensureBoardInviteCode(board)));

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
  await ensureBoardInviteCode(req.board);
  const members = await getBoardMembers(req.board._id, req.board.ownerId, req.board.memberIds);

  res.json({
    board: serializeBoard(req.board, req.user._id),
    members,
  });
});

const updateBoardMembers = asyncHandler(async (req, res) => {
  await ensureBoardInviteCode(req.board);
  req.board.memberIds = await validateMemberIds(req.body.memberIds || [], req.user._id);
  await req.board.save();

  const members = await getBoardMembers(req.board._id, req.board.ownerId, req.board.memberIds);

  res.json({
    board: serializeBoard(req.board, req.user._id),
    members,
  });
});

const getBoardInvite = asyncHandler(async (req, res) => {
  const inviteCode = requireNonEmptyString(req.params.inviteCode, "inviteCode", 12).toUpperCase();
  const board = await Board.findOne({ inviteCode });

  if (!board) {
    throw createHttpError(404, "Invite link is invalid");
  }

  const owner = await User.findById(board.ownerId, "name avatar");
  const isMember =
    board.ownerId.toString() === req.user._id.toString() ||
    board.memberIds.some((memberId) => memberId.toString() === req.user._id.toString());

  res.json({
    board: {
      _id: board._id,
      name: board.name,
      inviteCode: board.inviteCode,
      owner: owner
        ? {
            _id: owner._id,
            name: owner.name,
            avatar: owner.avatar || "",
          }
        : null,
      isMember,
    },
  });
});

const joinBoardByInvite = asyncHandler(async (req, res) => {
  const inviteCode = requireNonEmptyString(req.params.inviteCode, "inviteCode", 12).toUpperCase();
  const board = await Board.findOne({ inviteCode });

  if (!board) {
    throw createHttpError(404, "Invite link is invalid");
  }

  const isOwner = board.ownerId.toString() === req.user._id.toString();
  const isMember = board.memberIds.some((memberId) => memberId.toString() === req.user._id.toString());

  if (!isOwner && !isMember) {
    board.memberIds = [...board.memberIds, req.user._id];
    await board.save();
    await logBoardActivity({
      boardId: board._id,
      userId: req.user._id,
      action: "joined the board",
      entity: "board",
    });
  }

  res.json({
    board: serializeBoard(board, req.user._id),
    joined: !isOwner && !isMember,
  });
});

const getBoardActivity = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ boardId: req.board._id })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(activities);
});

const exportBoard = asyncHandler(async (req, res) => {
  await ensureBoardInviteCode(req.board);
  const tasks = await Task.find({ boardId: req.board._id })
    .populate("assigneeId", "name email")
    .sort({ createdAt: -1 });

  const members = await getBoardMembers(req.board._id, req.board.ownerId, req.board.memberIds);
  const workbook = new excelJS.Workbook();

  const summarySheet = workbook.addWorksheet("Summary");
  const groupedByUser = members.map((member) => {
    const assignedTasks = tasks.filter(
      (task) => task.assigneeId && task.assigneeId._id.toString() === member._id.toString()
    );

    return {
      name: member.name,
      email: member.email,
      tasks: assignedTasks.length,
      todo: assignedTasks.filter((task) => task.status === "TODO").length,
      inProgress: assignedTasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: assignedTasks.filter((task) => task.status === "DONE").length,
    };
  });

  const totals = tasks.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  );

  summarySheet.addRows([
    ["Board", req.board.name],
    ["Total TODO", totals.TODO],
    ["Total IN_PROGRESS", totals.IN_PROGRESS],
    ["Total DONE", totals.DONE],
    [],
    ["User", "Email", "Total Tasks", "TODO", "IN_PROGRESS", "DONE"],
    ...groupedByUser.map((row) => [row.name, row.email, row.tasks, row.todo, row.inProgress, row.done]),
  ]);

  const taskSheet = workbook.addWorksheet("Tasks");
  taskSheet.columns = [
    { header: "Title", key: "title", width: 28 },
    { header: "Status", key: "status", width: 18 },
    { header: "Priority", key: "priority", width: 18 },
    { header: "Assignee", key: "assignee", width: 28 },
    { header: "Archived", key: "archived", width: 14 },
    { header: "Created At", key: "createdAt", width: 24 },
  ];
  tasks.forEach((task) => {
    taskSheet.addRow({
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assigneeId?.name || "Unassigned",
      archived: task.isArchived ? "Yes" : "No",
      createdAt: task.createdAt.toISOString(),
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.board.name.replace(/[^a-zA-Z0-9-_]/g, "-")}-board-report.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

const deleteBoard = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.boardId, "boardId");

  const boardTasks = await Task.find({ boardId: req.board._id }, "_id");
  const taskIds = boardTasks.map((task) => task._id);

  await Promise.all([
    Comment.deleteMany({ taskId: { $in: taskIds } }),
    FileAttachment.deleteMany({ boardId: req.board._id }),
    Activity.deleteMany({ boardId: req.board._id }),
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
  getBoardInvite,
  joinBoardByInvite,
  getBoardActivity,
  exportBoard,
  deleteBoard,
};
