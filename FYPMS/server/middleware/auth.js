const { verifyJWT } = require('../utils/tokenGenerator');
const { query } = require('../config/database');

// Verify authentication token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Check if session exists and is valid
    const sessionSql = `
      SELECT s.*, u.is_active 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > NOW()
    `;
    
    const [session] = await query(sessionSql, [token]);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid.'
      });
    }

    if (!session.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled.'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Check if user has required role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user is administrator
const isAdmin = authorize('Administrator');

module.exports = {
  authenticate,
  authorize,
  isAdmin
};