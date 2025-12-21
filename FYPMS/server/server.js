const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { verifyEmailConfig } = require('./config/email');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/project');
const proposalRoutes = require('./routes/proposal');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ============================================
// CORS CONFIGURATION (CRITICAL FOR PROFILE PICTURES)
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// CRITICAL FIX: SERVE STATIC FILES FROM UPLOADS DIRECTORY
// This allows profile pictures to be accessed via /uploads/filename.jpg
// ============================================
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Uploads directory path:', uploadsPath);

app.use('/uploads', express.static(uploadsPath, {
  // Add security headers for images
  setHeaders: (res, filePath) => {
    // Allow images to be cached for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    
    // Set proper content type for images
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    if (contentTypes[ext]) {
      res.set('Content-Type', contentTypes[ext]);
    }
  }
}));

// ============================================
// RATE LIMITING
// ============================================
app.use('/api/', generalLimiter);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uploadsPath: uploadsPath
  });
});

// ============================================
// TEST ENDPOINT FOR UPLOADS DIRECTORY
// ============================================
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      success: true,
      uploadsPath,
      fileCount: files.length,
      files: files.slice(0, 10) // Show first 10 files only
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to read uploads directory',
      error: error.message
    });
  }
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Verify email configuration
    await verifyEmailConfig();

    // Ensure uploads directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('✅ Created uploads directory:', uploadsPath);
    } else {
      console.log('✅ Uploads directory exists:', uploadsPath);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('\n✅ ================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`✅ Uploads path: ${uploadsPath}`);
      console.log(`✅ Static files served at: http://localhost:${PORT}/uploads`);
      console.log('✅ ================================\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// ERROR HANDLERS
// ============================================

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// ============================================
// INITIALIZE SERVER
// ============================================
startServer();