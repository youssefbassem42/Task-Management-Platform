const FileAttachment = require("../models/FileAttachment");
const { asyncHandler, createHttpError } = require("../utils/http");
const { buildFileUrl, sanitizeFileName, deleteStoredFile } = require("../utils/files");
const { logBoardActivity } = require("../utils/activity");

const canDeleteAttachment = (attachment, board, userId) =>
  attachment.uploadedBy.toString() === userId.toString() ||
  board.ownerId.toString() === userId.toString();

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

const deleteBoardAttachment = asyncHandler(async (req, res) => {
  const attachment = await FileAttachment.findOne({
    _id: req.params.attachmentId,
    boardId: req.board._id,
    taskId: null,
  });

  if (!attachment) {
    throw createHttpError(404, "Attachment not found");
  }

  if (!canDeleteAttachment(attachment, req.board, req.user._id)) {
    throw createHttpError(403, "You do not have permission to delete this attachment");
  }

  const deletedFileName = attachment.fileName;
  await attachment.deleteOne();
  await deleteStoredFile(attachment.fileUrl);

  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `deleted board file "${deletedFileName}"`,
    entity: "attachment",
  });

  res.json({ success: true, attachmentId: req.params.attachmentId });
});

const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const attachment = await FileAttachment.findOne({
    _id: req.params.attachmentId,
    boardId: req.board._id,
    taskId: req.task._id,
  });

  if (!attachment) {
    throw createHttpError(404, "Attachment not found");
  }

  if (!canDeleteAttachment(attachment, req.board, req.user._id)) {
    throw createHttpError(403, "You do not have permission to delete this attachment");
  }

  const deletedFileName = attachment.fileName;
  await attachment.deleteOne();
  await deleteStoredFile(attachment.fileUrl);

  await logBoardActivity({
    boardId: req.board._id,
    userId: req.user._id,
    action: `deleted file "${deletedFileName}" from "${req.task.title}"`,
    entity: "attachment",
  });

  res.json({ success: true, attachmentId: req.params.attachmentId });
});

module.exports = {
  listBoardAttachments,
  uploadBoardAttachment,
  listTaskAttachments,
  uploadTaskAttachment,
  deleteBoardAttachment,
  deleteTaskAttachment,
};
