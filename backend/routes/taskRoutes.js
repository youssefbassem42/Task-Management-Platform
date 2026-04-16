const express = require("express");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  archiveTask,
  deleteTask,
} = require("../controllers/taskController");
const { getTaskComments, addComment } = require("../controllers/commentController");
const {
  loadBoard,
  requireBoardAccess,
  requireBoardOwner,
  loadTask,
} = require("../middlewares/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(loadBoard);

router
  .route("/")
  .get(requireBoardAccess, getTasks)
  .post(requireBoardOwner, createTask);

router
  .route("/:taskId")
  .get(requireBoardAccess, loadTask, getTaskById)
  .put(requireBoardOwner, loadTask, updateTask)
  .delete(requireBoardOwner, loadTask, deleteTask);

router.patch("/:taskId/status", requireBoardAccess, loadTask, updateTaskStatus);
router.patch("/:taskId/archive", requireBoardOwner, loadTask, archiveTask);

router
  .route("/:taskId/comments")
  .get(requireBoardAccess, loadTask, getTaskComments)
  .post(requireBoardAccess, loadTask, addComment);

module.exports = router;
