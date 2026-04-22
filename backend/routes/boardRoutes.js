const express = require("express");
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoardDetails,
  updateBoardMembers,
  getBoardInvite,
  joinBoardByInvite,
  getBoardActivity,
  exportBoard,
  deleteBoard,
  getDashboardStats
} = require("../controllers/boardController");
const {
  listBoardAttachments,
  uploadBoardAttachment,
  listTaskAttachments,
  uploadTaskAttachment,
  deleteBoardAttachment,
  deleteTaskAttachment,
} = require("../controllers/attachmentController");
const {
  protect,
  loadBoard,
  loadTask,
  requireBoardAccess,
  requireBoardOwner,
} = require("../middlewares/authMiddleware");
const { attachmentUpload } = require("../middlewares/uploadMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { createBoardSchema, updateBoardSchema } = require("../utils/validations");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(protect);

router.route("/").get(getBoards).post(validateRequest(createBoardSchema), createBoard);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/join/:inviteCode").get(getBoardInvite).post(joinBoardByInvite);

router
  .route("/:boardId")
  .get(loadBoard, requireBoardAccess, getBoardById)
  .put(loadBoard, requireBoardOwner, validateRequest(updateBoardSchema), updateBoardDetails)
  .delete(loadBoard, requireBoardOwner, deleteBoard);

router.put("/:boardId/members", loadBoard, requireBoardOwner, updateBoardMembers);
router.get("/:boardId/activity", loadBoard, requireBoardAccess, getBoardActivity);
router.get("/:boardId/export", loadBoard, requireBoardOwner, exportBoard);
router
  .route("/:boardId/attachments")
  .get(loadBoard, requireBoardAccess, listBoardAttachments)
  .post(loadBoard, requireBoardAccess, attachmentUpload.single("file"), uploadBoardAttachment);
router.delete(
  "/:boardId/attachments/:attachmentId",
  loadBoard,
  requireBoardAccess,
  deleteBoardAttachment
);
router
  .route("/:boardId/tasks/:taskId/attachments")
  .get(loadBoard, requireBoardAccess, loadTask, listTaskAttachments)
  .post(
    loadBoard,
    requireBoardAccess,
    loadTask,
    attachmentUpload.single("file"),
    uploadTaskAttachment
  );
router.delete(
  "/:boardId/tasks/:taskId/attachments/:attachmentId",
  loadBoard,
  requireBoardAccess,
  loadTask,
  deleteTaskAttachment
);
router.use("/:boardId/tasks", taskRoutes);

module.exports = router;
