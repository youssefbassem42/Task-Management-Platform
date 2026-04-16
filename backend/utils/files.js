const path = require("path");

const ensureUploadsDir = path.resolve(__dirname, "..", "uploads");

const sanitizeFileName = (fileName = "") => fileName.replace(/\s+/g, " ").trim();

const buildFileUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(fileName)}`;

module.exports = {
  ensureUploadsDir,
  sanitizeFileName,
  buildFileUrl,
};
