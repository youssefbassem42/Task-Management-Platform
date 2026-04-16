const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    entity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ boardId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
