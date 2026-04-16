const Activity = require("../models/Activity");

const logBoardActivity = async ({ boardId, userId, action, entity }) => {
  if (!boardId || !userId || !action || !entity) {
    return null;
  }

  return Activity.create({
    boardId,
    userId,
    action,
    entity,
  });
};

module.exports = {
  logBoardActivity,
};
