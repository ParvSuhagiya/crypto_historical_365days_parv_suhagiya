const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        data: null,
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      data: null,
    });
  }
};

module.exports = adminMiddleware;
