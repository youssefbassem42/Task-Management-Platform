const Notification = require("../models/Notification");
const { asyncHandler, createHttpError } = require("../utils/http");
const { ensureObjectId } = require("../utils/validators");

/**
 * GET /api/notifications
 * Returns notifications for the current user.
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({ notifications, unreadCount });
});

/**
 * PATCH /api/notifications/:id/read
 * Marks a notification as read.
 */
const markAsRead = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "notificationId");

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  res.json(notification);
});

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications as read for the current user.
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({ message: "All notifications marked as read" });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
