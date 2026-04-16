const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 12,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
