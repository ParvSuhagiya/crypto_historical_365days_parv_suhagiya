const loggerMiddleware = (req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${req.method}] ${req.originalUrl} — ${ts}`);
  next();
};

module.exports = loggerMiddleware;
