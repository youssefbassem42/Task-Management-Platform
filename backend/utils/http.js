const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

module.exports = {
  asyncHandler,
  createHttpError,
};
