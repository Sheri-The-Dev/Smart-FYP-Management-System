// Check if user is administrator
const isAdmin = authorize('Administrator');

const requireSupervisor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'Teacher') {
    return res.status(403).json({
      success: false,
      message: 'Supervisor access required'
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  isAdmin
  isAdmin,
  requireSupervisor
};