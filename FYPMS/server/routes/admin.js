const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  adminRequestPasswordReset,
  initiateSecurityChallenge,
  getSecurityQuestions,
  verifySecurityAnswers,
  completePasswordReset,
  getAuditLogs,
  getDashboardStats,
  bulkCreateUsers
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validation');
const { uploadCSV, handleUploadError } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// User management
router.post('/users', validationRules.createUser, validate, createUser);
router.post('/users/bulk-create', uploadCSV.single('csvFile'), handleUploadError, bulkCreateUsers);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Password reset (admin-initiated)
router.post('/users/:id/request-password-reset', adminRequestPasswordReset);
router.post('/users/:id/initiate-security-challenge', initiateSecurityChallenge);

// Security question challenge (public access with token)
router.get('/security-questions', getSecurityQuestions);
router.post('/verify-security-answers', validationRules.answerSecurityQuestions, validate, verifySecurityAnswers);
router.post('/complete-password-reset', validationRules.resetPassword, validate, completePasswordReset);

// Audit and statistics
router.get('/audit-logs', getAuditLogs);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;