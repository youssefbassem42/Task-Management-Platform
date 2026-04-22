const fs = require("fs/promises");
const path = require("path");

const ensureUploadsDir = path.resolve(__dirname, "..", "uploads");

const sanitizeFileName = (fileName = "") => fileName.replace(/\s+/g, " ").trim();

const buildFileUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(fileName)}`;

const getStoredFileName = (fileUrl = "") => {
  if (!fileUrl) return null;

  try {
    const pathname = new URL(fileUrl).pathname;
    const fileName = pathname.split("/uploads/")[1];
    return fileName ? decodeURIComponent(fileName) : null;
  } catch (error) {
    return null;
  }
};

const deleteStoredFile = async (fileUrl) => {
  const fileName = getStoredFileName(fileUrl);
  if (!fileName) return;

  const filePath = path.join(ensureUploadsDir, fileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

module.exports = {
  ensureUploadsDir,
  sanitizeFileName,
  buildFileUrl,
  getStoredFileName,
  deleteStoredFile,
};
