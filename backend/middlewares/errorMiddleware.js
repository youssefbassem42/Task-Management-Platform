const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack || err.message);
  }

  const statusCode = err.statusCode || res.statusCode || 500;

  res.status(statusCode >= 400 ? statusCode : 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = { errorHandler };
