const express = require("express");
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoardMembers,
  deleteBoard,
} = require("../controllers/boardController");
const { protect, loadBoard, requireBoardAccess, requireBoardOwner } = require("../middlewares/authMiddleware");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(protect);

router.route("/").get(getBoards).post(createBoard);

router
  .route("/:boardId")
  .get(loadBoard, requireBoardAccess, getBoardById)
  .delete(loadBoard, requireBoardOwner, deleteBoard);

router.put("/:boardId/members", loadBoard, requireBoardOwner, updateBoardMembers);
router.use("/:boardId/tasks", taskRoutes);

module.exports = router;
