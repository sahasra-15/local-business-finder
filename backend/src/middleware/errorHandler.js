export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  let errors = null;

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 409;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please authenticate.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired. Please login again.';
    statusCode = 401;
  }

  console.error(`[Error] ${statusCode} - ${message}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
