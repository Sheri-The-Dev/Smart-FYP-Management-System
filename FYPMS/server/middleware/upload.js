const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base uploads directory
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('✅ Directory created:', dir);
  }
};

ensureDir(uploadDir);

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || 'unknown';
    cb(null, `profile_${userId}_${uniqueSuffix}${ext}`);
  }
});

// Configure storage for CSV files
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const adminId = req.user?.id || 'unknown';
    cb(null, `bulk_users_${adminId}_${uniqueSuffix}.csv`);
  }
});

// Image file filter
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Invalid file type. Only image files are allowed.'), false);
};

// CSV file filter
const csvFileFilter = (req, file, cb) => {
  file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')
    ? cb(null, true)
    : cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
};

// Multer upload instances
const upload = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Upload error handler
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File size too large. Maximum size is 5MB.'
          : `Upload error: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

// Delete old profile picture
const deleteOldProfilePicture = (filename) => {
  if (!filename) return;

  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting old profile picture:', err);
    } else {
      console.log('✅ Old profile picture deleted:', filename);
    }
  });
};

// PDF storage (proposals)
const proposalDir = path.join(uploadDir, 'proposals');
ensureDir(proposalDir);

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proposalDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proposal-${uniqueSuffix}.pdf`);
  }
});

const pdfFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files are allowed'), false);
};

const uploadProposalPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
  upload,
  uploadCSV,
  handleUploadError,
  deleteOldProfilePicture,
  uploadProposalPDF
};
