const FileAttachment = require("../models/FileAttachment");
const { asyncHandler, createHttpError } = require("../utils/http");
const { buildFileUrl, sanitizeFileName } = require("../utils/files");
const { logBoardActivity } = require("../utils/activity");

const listBoardAttachments = asyncHandler(async (req, res) => {
  const attachments = await FileAttachment.find({
    boardId: req.board._id,
    taskId: null,
  })
    .populate("uploadedBy", "name email avatar")
    .sort({ createdAt: -1 });

  res.json(attachments);
});

const uploadBoardAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Attachment file is required");
  }

  const attachment = await FileAttachment.create({
    boardId: req.board._id,
    taskId: null,
    uploadedBy: req.user._id,
    fileName: sanitizeFileName(req.file.originalname || req.file.filename),
    fileUrl: buildFileUrl(req, req.file.filename),
  });

  await attachment.populate("uploadedBy", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `uploaded board file "${attachment.fileName}"`,
    entity: "attachment",
  });

  res.status(201).json(attachment);
});

const listTaskAttachments = asyncHandler(async (req, res) => {
  const attachments = await FileAttachment.find({
    boardId: req.board._id,
    taskId: req.task._id,
  })
    .populate("uploadedBy", "name email avatar")
    .sort({ createdAt: -1 });

  res.json(attachments);
});

const uploadTaskAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "Attachment file is required");
  }

  const attachment = await FileAttachment.create({
    boardId: req.board._id,
    taskId: req.task._id,
    uploadedBy: req.user._id,
    fileName: sanitizeFileName(req.file.originalname || req.file.filename),
    fileUrl: buildFileUrl(req, req.file.filename),
  });

  await attachment.populate("uploadedBy", "name email avatar");
  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `uploaded file "${attachment.fileName}" to "${req.task.title}"`,
    entity: "attachment",
  });

  res.status(201).json(attachment);
});

module.exports = {
  listBoardAttachments,
  uploadBoardAttachment,
  listTaskAttachments,
  uploadTaskAttachment,
};
