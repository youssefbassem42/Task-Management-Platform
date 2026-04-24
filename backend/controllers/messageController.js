const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { asyncHandler, createHttpError } = require("../utils/http");
const { requireNonEmptyString, ensureObjectId } = require("../utils/validators");
const { sendNewMessageEmail } = require("../utils/email");

/**
 * GET /api/messages/conversations
 * Returns a list of conversations (unique users) with the last message.
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", userId] },
                  { $eq: ["$readAt", null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  const otherUserIds = conversations.map((c) => c._id);
  const users = await User.find(
    { _id: { $in: otherUserIds } },
    "name email avatar"
  );

  const usersMap = users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {});

  const result = conversations.map((c) => ({
    user: usersMap[c._id.toString()] || null,
    lastMessage: {
      _id: c.lastMessage._id,
      text: c.lastMessage.text,
      senderId: c.lastMessage.senderId,
      createdAt: c.lastMessage.createdAt,
    },
    unreadCount: c.unreadCount,
  }));

  res.json(result);
});

/**
 * GET /api/messages/:userId
 * Returns messages between the current user and the target user.
 */
const getMessages = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "userId");
  const otherUserId = req.params.userId;
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(200);

  // Mark unread messages as read
  await Message.updateMany(
    { senderId: otherUserId, receiverId: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  res.json(messages);
});

/**
 * POST /api/messages/:userId
 * Sends a message to a user.
 */
const sendMessage = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "userId");
  const receiverId = req.params.userId;
  const senderId = req.user._id;

  if (senderId.toString() === receiverId) {
    throw createHttpError(400, "Cannot send message to yourself");
  }

  const text = requireNonEmptyString(req.body.text, "text", 4000);

  const receiver = await User.findById(receiverId, "name email");
  if (!receiver) {
    throw createHttpError(404, "User not found");
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text,
  });

  // Create notification for receiver
  await Notification.create({
    userId: receiverId,
    type: "MESSAGE_RECEIVED",
    message: `${req.user.name} sent you a message`,
    link: `/chat/${senderId}`,
    metadata: { senderId, messageId: message._id },
  });

  const unreadMessages = await Message.find({
    senderId,
    receiverId,
    readAt: null
  }).sort({ createdAt: 1 });

  // Send email notification every 3 unread messages to reduce email service cost
  if (unreadMessages.length > 0 && unreadMessages.length % 3 === 0) {
    const last3 = unreadMessages.slice(-3);
    const combinedText = last3.map(m => m.text).join('\n\n---\n\n');
    
    try {
      await sendNewMessageEmail(receiver.email, req.user.name, combinedText, senderId.toString());
    } catch (e) {
      console.error("Failed to send message notification email", e);
    }
  }

  res.status(201).json(message);
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
