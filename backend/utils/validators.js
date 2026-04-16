const mongoose = require("mongoose");
const { createHttpError } = require("./http");

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(400, `${fieldName} is invalid`);
  }
};

const requireNonEmptyString = (value, fieldName, maxLength = 5000) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  if (value.trim().length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long`);
  }

  return value.trim();
};

const optionalTrimmedString = (value, maxLength = 5000) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    throw createHttpError(400, "Invalid string value");
  }

  if (value.trim().length > maxLength) {
    throw createHttpError(400, "String value is too long");
  }

  return value.trim();
};

const ensureEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw createHttpError(400, `${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }

  return value;
};

const normalizeIdArray = (values, fieldName) => {
  if (values === undefined) {
    return undefined;
  }

  if (!Array.isArray(values)) {
    throw createHttpError(400, `${fieldName} must be an array`);
  }

  const uniqueIds = [...new Set(values.filter(Boolean))];
  uniqueIds.forEach((id) => ensureObjectId(id, fieldName));
  return uniqueIds;
};

module.exports = {
  ensureObjectId,
  requireNonEmptyString,
  optionalTrimmedString,
  ensureEnum,
  normalizeIdArray,
};
