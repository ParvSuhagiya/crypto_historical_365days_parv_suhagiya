const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  const body = {
    success: false,
    message: err.message || 'Internal server error',
    data: null,
  };

  if (isDev && err.stack) {
    body.error = err.stack;
  } else if (isDev) {
    body.error = String(err);
  }

  if (res.headersSent) {
    return next(err);
  }
  res.status(status).json(body);
};

module.exports = errorHandler;
