const { createHttpError } = require("./http");

const SENDER = {
  name: "Taskify",
  email: "sofaashraf42@gmail.com"
};

const sendEmail = async (to, subject, htmlContent) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not set. Email not sent.");
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return;
  }

  const url = "https://api.brevo.com/v3/smtp/email";
  const payload = {
    sender: SENDER,
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Send Email exception:", error);
  }
};

const sendAccountVerificationEmail = async (email, token) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${FRONTEND_URL}/verify-email?token=${token}`;
  const htmlContent = `
    <h2>Welcome to Taskify!</h2>
    <p>Please click the link below to verify your account:</p>
    <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Account</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, "Verify Your Taskify Account", htmlContent);
};

const sendPasswordResetEmail = async (email, token) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, "Reset Your Taskify Password", htmlContent);
};

const sendTaskAssignedEmail = async (email, taskDetails, boardName) => {
  const htmlContent = `
    <h2>New Task Assigned</h2>
    <p>You have been assigned a new task in the board <strong>${boardName}</strong>.</p>
    <div style="background:#f4f4f4;padding:15px;margin:20px 0;border-left:4px solid #007bff;">
      <h3>${taskDetails.title}</h3>
      <p><strong>Priority:</strong> ${taskDetails.priority}</p>
      <p><strong>Status:</strong> ${taskDetails.status}</p>
      ${taskDetails.dueDate ? `<p><strong>Due Date:</strong> ${new Date(taskDetails.dueDate).toLocaleDateString()}</p>` : ""}
      ${taskDetails.description ? `<p>${taskDetails.description}</p>` : ""}
    </div>
    <p>Log in to Taskify to view more details.</p>
  `;
  await sendEmail(email, `Task Assigned: ${boardName}`, htmlContent);
};

const sendTaskReminderEmail = async (email, taskDetails, boardName, reminderType) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  let subjectPrefix = "";
  let message = "";
  if (reminderType === "TODAY") {
    subjectPrefix = "Due Today";
    message = "is due today";
  } else if (reminderType === "TOMORROW") {
    subjectPrefix = "Due Tomorrow";
    message = "is due tomorrow";
  } else if (reminderType === "OVERDUE") {
    subjectPrefix = "Overdue Task";
    message = "is currently overdue";
  }

  const htmlContent = `
    <h2>Task Reminder: ${subjectPrefix}</h2>
    <p>This is a reminder that the task <strong>${taskDetails.title}</strong> in board <strong>${boardName}</strong> ${message}.</p>
    <a href="${FRONTEND_URL}" style="display:inline-block;padding:10px 20px;background:#dc3545;color:#fff;text-decoration:none;border-radius:5px;">View Task</a>
  `;
  await sendEmail(email, `[Action Required] ${subjectPrefix}: ${taskDetails.title}`, htmlContent);
};

const sendNewMessageEmail = async (email, senderName, messageText, senderId) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const preview = messageText.length > 200 ? messageText.slice(0, 200) + '…' : messageText;
  const chatLink = senderId ? `${FRONTEND_URL}/chat/${senderId}` : `${FRONTEND_URL}/chat`;
  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e;">
      <h2 style="margin:0 0 12px;font-size:20px;">New Message from ${senderName}</h2>
      <p style="color:#555;margin:0 0 20px;font-size:14px;">You have received a new direct message on Taskify.</p>
      <div style="background:#f8f9fb;padding:16px 20px;margin:0 0 24px;border-left:4px solid #6750A4;border-radius:0 12px 12px 0;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#6750A4;">${senderName} wrote:</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap;">${preview}</p>
      </div>
      <a href="${chatLink}" style="display:inline-block;padding:12px 28px;background:#6750A4;color:#fff;text-decoration:none;border-radius:24px;font-weight:600;font-size:14px;">Open Conversation</a>
      <p style="margin:20px 0 0;font-size:12px;color:#888;">Log in to Taskify to reply.</p>
    </div>
  `;
  await sendEmail(email, `💬 ${senderName} sent you a message`, htmlContent);
};

module.exports = {
  sendEmail,
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
  sendTaskAssignedEmail,
  sendTaskReminderEmail,
  sendNewMessageEmail
};
