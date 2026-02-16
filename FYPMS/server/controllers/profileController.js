const { query } = require('../config/database');
const { logAudit, getClientIp, AuditActions } = require('../utils/logger');
const { deleteOldProfilePicture } = require('../middleware/upload');
const path = require('path');

// Get current user profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userSql = `
      SELECT 
        id, username, email, role, phone, department, 
        research_areas, expertise, availability_status,
        profile_picture, created_at, last_login, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const [user] = await query(userSql, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred retrieving your profile.'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, department, research_areas, expertise, availability_status } = req.body;
    const ipAddress = getClientIp(req);

    // Get current user data
    const [currentUser] = await query('SELECT username, email, role FROM users WHERE id = ?', [userId]);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== currentUser.email) {
      const [existingEmail] = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    const changes = {};

    if (name !== undefined && name !== currentUser.username) {
      updates.push('username = ?');
      params.push(name);
      changes.name = name;
    }

    if (email !== undefined && email !== currentUser.email) {
      updates.push('email = ?');
      params.push(email);
      changes.email = email;
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
      changes.phone = phone;
    }

    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
      changes.department = department;
    }

    // Teacher-specific fields
    if (currentUser.role === 'Teacher') {
      if (research_areas !== undefined) {
        updates.push('research_areas = ?');
        params.push(research_areas);
        changes.research_areas = research_areas;
      }

      if (expertise !== undefined) {
        updates.push('expertise = ?');
        params.push(expertise);
        changes.expertise = expertise;
      }

      if (availability_status !== undefined) {
        updates.push('availability_status = ?');
        params.push(availability_status);
        changes.availability_status = availability_status;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(userId);

    const updateSql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await query(updateSql, params);

    // Log profile update
    await logAudit({
      userId,
      action: AuditActions.PROFILE_UPDATED,
      entityType: 'user',
      entityId: userId,
      details: { username: currentUser.username, changes },
      ipAddress
    });

    // Get updated user data
    const userSql = `
      SELECT 
        id, username, email, role, phone, department, 
        research_areas, expertise, availability_status,
        profile_picture, created_at, last_login, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const [updatedUser] = await query(userSql, [userId]);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred updating your profile.'
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = getClientIp(req);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    // Get old profile picture
    const [user] = await query('SELECT profile_picture, username FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Delete old profile picture if exists
    if (user.profile_picture) {
      deleteOldProfilePicture(user.profile_picture);
    }

    // Update database with new profile picture filename
    const filename = req.file.filename;
    await query('UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?', [filename, userId]);

    // Log profile picture update
    await logAudit({
      userId,
      action: AuditActions.PROFILE_PICTURE_UPDATED,
      entityType: 'user',
      entityId: userId,
      details: { username: user.username, filename },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture: filename,
        url: `/uploads/${filename}`
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred uploading profile picture.'
    });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = getClientIp(req);

    // Get current profile picture
    const [user] = await query('SELECT profile_picture, username FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.profile_picture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete.'
      });
    }

    // Delete file
    deleteOldProfilePicture(user.profile_picture);

    // Update database
    await query('UPDATE users SET profile_picture = NULL, updated_at = NOW() WHERE id = ?', [userId]);

    // Log profile picture deletion
    await logAudit({
      userId,
      action: AuditActions.PROFILE_PICTURE_DELETED,
      entityType: 'user',
      entityId: userId,
      details: { username: user.username },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred deleting profile picture.'
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture
}; 
