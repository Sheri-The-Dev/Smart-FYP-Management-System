const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateResetToken, generateChallengeToken, generateSecureToken } = require('../utils/tokenGenerator');
const { sendAccountCreationEmail, sendPasswordResetEmail, sendSecurityChallengeEmail } = require('../utils/emailService');
const { logAudit, getClientIp, AuditActions } = require('../utils/logger');

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { username, email, role, password, sendEmail } = req.body;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Check if username already exists
    const [existingUser] = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists.'
      });
    }

    // Generate temporary password if not provided
    const temporaryPassword = password || generateSecureToken(12);
    const passwordHash = await bcrypt.hash(temporaryPassword, parseInt(process.env.BCRYPT_ROUNDS));

    // Create user
    const userSql = `
      INSERT INTO users (username, email, password_hash, role, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(userSql, [username, email, passwordHash, role, adminId]);
    const newUserId = result.insertId;

    // Log user creation
    await logAudit({
      userId: newUserId,
      adminId,
      action: AuditActions.USER_CREATED,
      entityType: 'user',
      entityId: newUserId,
      details: { username, email, role },
      ipAddress
    });

    // Send account creation email if requested
    if (sendEmail) {
      try {
        await sendAccountCreationEmail(email, username, temporaryPassword);
      } catch (emailError) {
        console.error('Account creation email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUserId,
        username,
        email,
        role,
        temporaryPassword: sendEmail ? undefined : temporaryPassword
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred creating the user.'
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        u.id, u.username, u.email, u.role, u.is_active, 
        u.created_at, u.last_login,
        creator.username as created_by_username
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE 1=1
    `;
    
    const params = [];

    // Filter by role
    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    // Search by username or email
    if (search) {
      sql += ' AND (u.username LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    // Add pagination
    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving users.'
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userSql = `
      SELECT 
        u.id, u.username, u.email, u.role, u.is_active, 
        u.created_at, u.last_login, u.updated_at,
        creator.username as created_by_username,
        (SELECT COUNT(*) FROM security_questions WHERE user_id = u.id) as has_security_questions
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE u.id = ?
    `;
    
    const [user] = await query(userSql, [id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get recent activity
    const activitySql = `
      SELECT action, details, created_at, ip_address
      FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const activities = await query(activitySql, [id]);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        recentActivity: activities
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving the user.'
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, is_active } = req.body;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Check if user exists
    const [user] = await query('SELECT username FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent admin from disabling themselves
    if (id == adminId && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own account.'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const [existingEmail] = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (typeof is_active !== 'undefined') {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const updateSql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await query(updateSql, params);

    // Log update
    await logAudit({
      userId: id,
      adminId,
      action: AuditActions.USER_UPDATED,
      entityType: 'user',
      entityId: id,
      details: { username: user.username, changes: { email, role, is_active } },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred updating the user.'
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Prevent admin from deleting themselves
    if (id == adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    // Get user info before deletion
    const [user] = await query('SELECT username, email FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = ?', [id]);

    // Log deletion
    await logAudit({
      adminId,
      action: AuditActions.USER_DELETED,
      entityType: 'user',
      entityId: id,
      details: { username: user.username, email: user.email },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred deleting the user.'
    });
  }
};

// Admin-initiated password reset via email
const adminRequestPasswordReset = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Get user info
    const [user] = await query(
      'SELECT username, email FROM users WHERE id = ? AND is_active = true',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    // Generate reset token
    const { token, expiresAt } = generateResetToken();

    // Save token
    const tokenSql = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `;
    await query(tokenSql, [id, token, expiresAt]);

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.username, token);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email.'
      });
    }

    // Log action
    await logAudit({
      userId: id,
      adminId,
      action: AuditActions.ADMIN_PASSWORD_RESET_INITIATED,
      entityType: 'user',
      entityId: id,
      details: { username: user.username, method: 'email' },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: `Password reset email sent to ${user.email}`
    });

  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred initiating password reset.'
    });
  }
};

// Initiate security question challenge (Admin only)
const initiateSecurityChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Get user info
    const [user] = await query(
      'SELECT username, email FROM users WHERE id = ? AND is_active = true',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    // Check if user has security questions
    const [securityQuestion] = await query(
      'SELECT COUNT(*) as count FROM security_questions WHERE user_id = ?',
      [id]
    );

    if (!securityQuestion || securityQuestion.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'User has not set up security questions.'
      });
    }

    // Get admin info
    const [admin] = await query('SELECT username FROM users WHERE id = ?', [adminId]);

    // Generate challenge token
    const { token, expiresAt } = generateChallengeToken();

    // Create challenge
    const challengeSql = `
      INSERT INTO security_question_challenges (user_id, admin_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    await query(challengeSql, [id, adminId, token, expiresAt]);

    // Send challenge email
    try {
      await sendSecurityChallengeEmail(user.email, user.username, token, admin.username);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send security challenge email.'
      });
    }

    // Log action
    await logAudit({
      userId: id,
      adminId,
      action: AuditActions.ADMIN_SECURITY_CHALLENGE_SENT,
      entityType: 'user',
      entityId: id,
      details: { username: user.username },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: `Security challenge sent to ${user.email}`,
      data: {
        challengeId: token,
        expiresAt
      }
    });

  } catch (error) {
    console.error('Initiate security challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred initiating security challenge.'
    });
  }
};

// Get security questions for challenge
const getSecurityQuestions = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Challenge token is required.'
      });
    }

    // Validate token
    const challengeSql = `
      SELECT c.*, u.username, u.email
      FROM security_question_challenges c
      JOIN users u ON c.user_id = u.id
      WHERE c.token = ? AND c.status = 'pending' AND c.expires_at > NOW()
    `;
    
    const [challenge] = await query(challengeSql, [token]);

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge token.'
      });
    }

    // Get security questions (without answers)
    const questionsSql = `
      SELECT id, question
      FROM security_questions
      WHERE user_id = ?
      ORDER BY id
    `;
    
    const questions = await query(questionsSql, [challenge.user_id]);

    res.status(200).json({
      success: true,
      data: {
        username: challenge.username,
        questions
      }
    });

  } catch (error) {
    console.error('Get security questions error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving security questions.'
    });
  }
};

// Verify security answers
const verifySecurityAnswers = async (req, res) => {
  try {
    const { token, answers } = req.body;
    const ipAddress = getClientIp(req);

    // Validate token
    const challengeSql = `
      SELECT c.*, u.username, u.email
      FROM security_question_challenges c
      JOIN users u ON c.user_id = u.id
      WHERE c.token = ? AND c.status = 'pending' AND c.expires_at > NOW()
    `;
    
    const [challenge] = await query(challengeSql, [token]);

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge token.'
      });
    }

    // Get stored security questions and answers
    const questionsSql = `
      SELECT id, question, answer_hash
      FROM security_questions
      WHERE user_id = ?
    `;
    
    const storedQuestions = await query(questionsSql, [challenge.user_id]);

    // Verify all answers
    let allCorrect = true;
    for (const answer of answers) {
      const storedQuestion = storedQuestions.find(q => q.id === answer.questionId);
      
      if (!storedQuestion) {
        allCorrect = false;
        break;
      }

      const isCorrect = await bcrypt.compare(
        answer.answer.toLowerCase().trim(),
        storedQuestion.answer_hash
      );

      if (!isCorrect) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      // Update challenge status
      await query(
        'UPDATE security_question_challenges SET status = ?, completed_at = NOW() WHERE token = ?',
        ['failed', token]
      );

      // Log failed verification
      await logAudit({
        userId: challenge.user_id,
        adminId: challenge.admin_id,
        action: AuditActions.SECURITY_QUESTION_FAILED,
        details: { username: challenge.username },
        ipAddress
      });

      return res.status(401).json({
        success: false,
        message: 'Security answers are incorrect.'
      });
    }

    // Update challenge status to verified
    await query(
      'UPDATE security_question_challenges SET status = ?, completed_at = NOW() WHERE token = ?',
      ['verified', token]
    );

    // Log successful verification
    await logAudit({
      userId: challenge.user_id,
      adminId: challenge.admin_id,
      action: AuditActions.SECURITY_QUESTION_VERIFIED,
      details: { username: challenge.username },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Identity verified successfully',
      data: {
        challengeToken: token
      }
    });

  } catch (error) {
    console.error('Verify security answers error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred verifying security answers.'
    });
  }
};

// Complete password reset after verification
const completePasswordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const ipAddress = getClientIp(req);

    // Validate challenge token is verified
    const challengeSql = `
      SELECT c.*, u.id as user_id, u.username, u.email
      FROM security_question_challenges c
      JOIN users u ON c.user_id = u.id
      WHERE c.token = ? AND c.status = 'verified'
    `;
    
    const [challenge] = await query(challengeSql, [token]);

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'Invalid challenge token or verification not completed.'
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));

    // Update password
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, challenge.user_id]
    );

    // Invalidate all sessions
    await query('DELETE FROM sessions WHERE user_id = ?', [challenge.user_id]);

    // Mark challenge as completed (update to a completed status)
    await query(
      'UPDATE security_question_challenges SET status = ? WHERE token = ?',
      ['expired', token]
    );

    // Log password reset
    await logAudit({
      userId: challenge.user_id,
      adminId: challenge.admin_id,
      action: AuditActions.ADMIN_PASSWORD_RESET_COMPLETED,
      details: { username: challenge.username, method: 'security_questions' },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully by administrator'
    });

  } catch (error) {
    console.error('Complete password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred completing password reset.'
    });
  }
};

// Get audit logs (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        a.*,
        u.username as user_username,
        admin.username as admin_username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN users admin ON a.admin_id = admin.id
      WHERE 1=1
    `;
    
    const params = [];

    if (userId) {
      sql += ' AND a.user_id = ?';
      params.push(userId);
    }

    if (action) {
      sql += ' AND a.action = ?';
      params.push(action);
    }

    if (startDate) {
      sql += ' AND a.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND a.created_at <= ?';
      params.push(endDate);
    }

    // Get total count
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    // Add pagination
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await query(sql, params);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving audit logs.'
    });
  }
};

// Get dashboard statistics (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Total users by role
    const userStatsSql = `
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
      FROM users
      GROUP BY role
    `;
    const userStats = await query(userStatsSql);

    // Recent logins (last 24 hours)
    const [recentLogins] = await query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE action = 'LOGIN_SUCCESS' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Failed login attempts (last 24 hours)
    const [failedLogins] = await query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE action = 'LOGIN_FAILED' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Password resets (last 7 days)
    const [passwordResets] = await query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE action IN ('PASSWORD_RESET_COMPLETED', 'ADMIN_PASSWORD_RESET_COMPLETED')
        AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Recent user creations (last 30 days)
    const [newUsers] = await query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.status(200).json({
      success: true,
      data: {
        userStats,
        recentActivity: {
          recentLogins: recentLogins?.count || 0,
          failedLogins: failedLogins?.count || 0,
          passwordResets: passwordResets?.count || 0,
          newUsers: newUsers?.count || 0
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving dashboard statistics.'
    });
  }
};

module.exports = {
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
  getDashboardStats
};