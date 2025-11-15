const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { validationRules, validate } = require('../middleware/validation');
const {
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture
} = require('../controllers/profileController');

// Get current user profile
router.get('/', authenticate, getMyProfile);

// Update profile
router.put('/', authenticate, validationRules.updateProfile, validate, updateProfile);

// Upload profile picture
router.post(
  '/picture',
  authenticate,
  upload.single('profile_picture'),
  handleUploadError,
  uploadProfilePicture
);

// Delete profile picture
router.delete('/picture', authenticate, deleteProfilePicture);

module.exports = router;