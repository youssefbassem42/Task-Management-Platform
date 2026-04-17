const cron = require("node-cron");
const Task = require("../models/Task");
const Board = require("../models/Board");
const { sendTaskReminderEmail } = require("../utils/email");

// Run once a day at 00:00 (Midnight) need to change to now 00:51
cron.schedule("51 0 * * *", async () => {
  console.log("Running task deadline reminder cron job...");
  try {
    const activeTasks = await Task.find({
      status: { $ne: "DONE" },
      isArchived: false,
      dueDate: { $ne: null },
      assigneeId: { $ne: null }
    }).populate("assigneeId", "name email").populate("boardId", "name");

    const now = new Date();
    // Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of tomorrow
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    // Start of day after tomorrow
    const startOfDayAfterTomorrow = new Date(startOfTomorrow);
    startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1);

    for (const task of activeTasks) {
      if (!task.assigneeId || !task.boardId) continue; // safety check

      const dueDate = new Date(task.dueDate);
      
      let reminderType = null;

      if (dueDate < startOfToday) {
        reminderType = "OVERDUE";
      } else if (dueDate >= startOfToday && dueDate < startOfTomorrow) {
        reminderType = "TODAY";
      } else if (dueDate >= startOfTomorrow && dueDate < startOfDayAfterTomorrow) {
        reminderType = "TOMORROW";
      }

      if (reminderType) {
        try {
          await sendTaskReminderEmail(
            task.assigneeId.email,
            task,
            task.boardId.name,
            reminderType
          );
        } catch (e) {
          console.error(`Failed to send reminder email for task ${task._id}`, e);
        }
      }
    }
    console.log("Task deadline reminder cron job finished successfully.");
  } catch (error) {
    console.error("Error running task deadline reminder cron job:", error);
  }
});
