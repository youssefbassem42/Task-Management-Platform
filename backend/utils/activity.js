const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const Board = require("../models/Board");

const logBoardActivity = async ({ boardId, userId, action, entity }) => {
  if (!boardId || !userId || !action || !entity) {
    return null;
  }

  const activity = await Activity.create({
    boardId,
    userId,
    action,
    entity,
  });

  // Create notifications for all board members (except the actor)
  try {
    const board = await Board.findById(boardId);
    if (board) {
      const allMemberIds = [
        board.ownerId.toString(),
        ...board.memberIds.map((id) => id.toString()),
      ];
      const uniqueIds = [...new Set(allMemberIds)].filter(
        (id) => id !== userId.toString()
      );

      // Map action to notification type
      let type = "BOARD_UPDATED";
      if (action.includes("created") && entity === "task") type = "TASK_CREATED";
      if (action.includes("updated") && entity === "task") type = "TASK_UPDATED";
      if (action.includes("assigned") && entity === "task") type = "TASK_ASSIGNED";
      if (action.includes("status") && entity === "task") type = "TASK_STATUS_CHANGED";
      if (action.includes("comment")) type = "TASK_COMMENTED";
      if (action.includes("joined")) type = "BOARD_MEMBER_JOINED";

      if (uniqueIds.length > 0) {
        const notifications = uniqueIds.map((memberId) => ({
          userId: memberId,
          type,
          message: `${action} in "${board.name}"`,
          link: `/boards/${boardId}`,
          metadata: { boardId, activityId: activity._id },
        }));

        await Notification.insertMany(notifications);
      }
    }
  } catch (err) {
    console.error("Failed to create notifications for activity:", err);
  }

  return activity;
};

module.exports = {
  logBoardActivity,
};
