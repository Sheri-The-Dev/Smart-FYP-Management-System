const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateResetToken, generateChallengeToken, generateSecureToken } = require('../utils/tokenGenerator');
const { sendAccountCreationEmail, sendPasswordResetEmail, sendSecurityChallengeEmail } = require('../utils/emailService');
const { logAudit, getClientIp, AuditActions } = require('../utils/logger');

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { username, email, role, password, sendEmail, department } = req.body;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Validate department for Teachers
    if (role === 'Teacher' && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for teachers.'
      });
    }

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
      INSERT INTO users (username, email, password_hash, role, department, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(userSql, [username, email, passwordHash, role, role === 'Teacher' ? department : null, adminId]);
    const newUserId = result.insertId;

    // Log user creation
    await logAudit({
      userId: newUserId,
      adminId,
      action: AuditActions.USER_CREATED,
      entityType: 'user',
      entityId: newUserId,
      details: { username, email, role, department: role === 'Teacher' ? department : undefined },
      ipAddress
    });

    // Send account creation email if requested
    if (sendEmail) {
      try {
        await sendAccountCreationEmail(email, username, temporaryPassword, role === 'Teacher' ? department : null);
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
        department: role === 'Teacher' ? department : null,
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
        u.id, u.username, u.email, u.role, u.department, u.is_active, 
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
        u.id, u.username, u.email, u.role, u.department, u.is_active, 
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
    const { email, role, is_active, department } = req.body;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    // Check if user exists
    const [user] = await query('SELECT username, role FROM users WHERE id = ?', [id]);
    
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

    // Handle department update
    // Allow updating department if role is Teacher OR if we are changing role to Teacher
    const effectiveRole = role || user.role;
    if (effectiveRole === 'Teacher' && department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    } else if (effectiveRole !== 'Teacher' && role) {
      // If changing from Teacher to something else, clear department
      updates.push('department = NULL');
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
      details: { username: user.username, changes: { email, role, is_active, department } },
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


// Bulk create users from CSV (Admin only)
const bulkCreateUsers = async (req, res) => {
  try {
    const { role } = req.body;
    const adminId = req.user.id;
    const ipAddress = getClientIp(req);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    // Read and parse CSV file
    const fs = require('fs');
    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Parse and validate emails (and departments for teachers)
    const usersToCreate = []; // Array of { email, department }
    const errors = [];
    const duplicatesInFile = new Set();

    lines.forEach((line, index) => {
      // For Teacher role, we expect: email,department
      // For others: email
      
      let email = '';
      let department = null;

      if (role === 'Teacher') {
        const parts = line.trim().split(',');
        if (parts.length < 2) {
          // Maybe they didn't provide department?
          // We should probably require it as per requirements "add one more field... for teacher role only"
          // But maybe we can allow empty? Let's require it if possible, or default to null.
          // User said "add the department field there", implies it should be present.
          email = parts[0].trim().replace(/^"|"$/g, '');
          // If missing department, we might flag error or allow null. Let's flag warning or error.
          // "add the department field there for teacher role only" -> implies usage.
          // Let's require it for better data integrity.
          // But wait, previous logic disallowed commas.
        } else {
          email = parts[0].trim().replace(/^"|"$/g, '');
          department = parts[1].trim().replace(/^"|"$/g, '');
        }
      } else {
        const trimmedLine = line.trim().replace(/^"|"$/g, ''); // Remove quotes
        // Check for commas (should only have emails for non-teachers)
        if (trimmedLine.includes(',')) {
          errors.push(`Line ${index + 1}: File should contain only email addresses (no commas allowed for ${role})`);
          return;
        }
        email = trimmedLine;
      }

      // Validate email format
      if (!emailRegex.test(email)) {
        errors.push(`Line ${index + 1}: Invalid email format - "${email}"`);
        return;
      }

      if (role === 'Teacher' && !department) {
         errors.push(`Line ${index + 1}: Department is required for Teachers (format: email,department)`);
         return;
      }

      const emailLower = email.toLowerCase();
      
      // Check for duplicates within file
      if (duplicatesInFile.has(emailLower)) {
        errors.push(`Line ${index + 1}: Duplicate email - "${email}"`);
        return;
      }

      duplicatesInFile.add(emailLower);
      usersToCreate.push({ email: emailLower, department });
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV validation failed',
        errors: errors
      });
    }

    // Check for existing users in database
    const emails = usersToCreate.map(u => u.email);
    const existingEmailsQuery = `
      SELECT email FROM users WHERE email IN (${emails.map(() => '?').join(',')})
    `;
    const existingUsers = await query(existingEmailsQuery, emails);
    const existingEmails = existingUsers.map(u => u.email.toLowerCase());

    // Filter out existing emails
    const newUsers = usersToCreate.filter(u => !existingEmails.includes(u.email));
    
    if (newUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All emails already exist in the system',
        data: {
          total: emails.length,
          existing: existingEmails.length,
          created: 0,
          failed: emails.length
        }
      });
    }

    // Create users
    const results = {
      created: 0,
      failed: 0,
      total: emails.length,
      existingEmails: existingEmails,
      failedEmails: []
    };

    for (const user of newUsers) {
      try {
        // Extract username from email (text before @)
        const username = user.email.split('@')[0];
        
        // Check if username already exists, if so append random number
        let finalUsername = username;
        let usernameExists = true;
        let attempts = 0;
        
        while (usernameExists && attempts < 5) {
          const [existingUser] = await query(
            'SELECT id FROM users WHERE username = ?',
            [finalUsername]
          );
          
          if (!existingUser) {
            usernameExists = false;
          } else {
            finalUsername = `${username}${Math.floor(Math.random() * 9999)}`;
            attempts++;
          }
        }

        if (usernameExists) {
          results.failed++;
          results.failedEmails.push({ email: user.email, reason: 'Username conflict' });
          continue;
        }

        // Generate secure password
        const temporaryPassword = generateSecureToken(12);
        const passwordHash = await bcrypt.hash(temporaryPassword, parseInt(process.env.BCRYPT_ROUNDS));

        // Insert user
        const userSql = `
          INSERT INTO users (username, email, password_hash, role, department, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(userSql, [finalUsername, user.email, passwordHash, role, user.department, adminId]);
        const newUserId = result.insertId;

        // Log user creation
        await logAudit({
          userId: newUserId,
          adminId,
          action: AuditActions.USER_CREATED,
          entityType: 'user',
          entityId: newUserId,
          details: { username: finalUsername, email: user.email, role, department: user.department, method: 'bulk_create' },
          ipAddress
        });

        // Send account creation email
        try {
          await sendAccountCreationEmail(user.email, finalUsername, temporaryPassword, role === 'Teacher' ? user.department : null);
          results.created++;
        } catch (emailError) {
          console.error('Email error for', user.email, ':', emailError);
          // Still count as created but note email failure
          results.created++;
          results.failedEmails.push({ email: user.email, reason: 'Email send failed' });
        }

      } catch (error) {
        console.error('Error creating user for', user.email, ':', error);
        results.failed++;
        results.failedEmails.push({ email: user.email, reason: error.message || 'Database error' });
      }
    }

    // Log bulk creation action
    await logAudit({
      userId: adminId,
      adminId,
      action: 'BULK_USER_CREATION',
      entityType: 'user',
      details: { 
        total: results.total, 
        created: results.created, 
        failed: results.failed,
        role 
      },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: `Bulk user creation completed. Created: ${results.created}, Failed: ${results.failed}`,
      data: results
    });

  } catch (error) {
    console.error('Bulk create users error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && require('fs').existsSync(req.file.path)) {
      require('fs').unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred during bulk user creation.'
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
  getDashboardStats,
  bulkCreateUsers
}; 
