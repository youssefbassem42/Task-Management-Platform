const express = require("express");
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoardMembers,
  getBoardInvite,
  joinBoardByInvite,
  getBoardActivity,
  exportBoard,
  deleteBoard,
} = require("../controllers/boardController");
const {
  listBoardAttachments,
  uploadBoardAttachment,
  listTaskAttachments,
  uploadTaskAttachment,
} = require("../controllers/attachmentController");
const {
  protect,
  loadBoard,
  loadTask,
  requireBoardAccess,
  requireBoardOwner,
} = require("../middlewares/authMiddleware");
const { attachmentUpload } = require("../middlewares/uploadMiddleware");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(protect);

router.route("/").get(getBoards).post(createBoard);
router.route("/join/:inviteCode").get(getBoardInvite).post(joinBoardByInvite);

router
  .route("/:boardId")
  .get(loadBoard, requireBoardAccess, getBoardById)
  .delete(loadBoard, requireBoardOwner, deleteBoard);

router.put("/:boardId/members", loadBoard, requireBoardOwner, updateBoardMembers);
router.get("/:boardId/activity", loadBoard, requireBoardAccess, getBoardActivity);
router.get("/:boardId/export", loadBoard, requireBoardOwner, exportBoard);
router
  .route("/:boardId/attachments")
  .get(loadBoard, requireBoardAccess, listBoardAttachments)
  .post(loadBoard, requireBoardAccess, attachmentUpload.single("file"), uploadBoardAttachment);
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
router.use("/:boardId/tasks", taskRoutes);

module.exports = router;
