const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.post("/:userId", sendMessage);

module.exports = router;
