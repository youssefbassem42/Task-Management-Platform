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
  requireTaskManageAccess,
} = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { createTaskSchema, updateTaskSchema } = require("../utils/validations");

const router = express.Router({ mergeParams: true });

router.use(loadBoard);

router
  .route("/")
  .get(requireBoardAccess, getTasks)
  .post(requireBoardOwner, validateRequest(createTaskSchema), createTask);

router
  .route("/:taskId")
  .get(requireBoardAccess, loadTask, getTaskById)
  .put(requireBoardAccess, loadTask, requireTaskManageAccess, validateRequest(updateTaskSchema), updateTask)
  .delete(requireBoardOwner, loadTask, deleteTask);

router.patch("/:taskId/status", requireBoardAccess, loadTask, updateTaskStatus);
router.patch("/:taskId/archive", requireBoardAccess, loadTask, requireTaskManageAccess, archiveTask);

router
  .route("/:taskId/comments")
  .get(requireBoardAccess, loadTask, getTaskComments)
  .post(requireBoardAccess, loadTask, addComment);

module.exports = router;
