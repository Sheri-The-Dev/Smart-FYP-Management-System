// Color scheme
export const COLORS = {
  primary: '#193869',
  secondary: '#d29538',
  complimentary: '#234e92',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// User roles
export const ROLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  COMMITTEE: 'Committee',
  ADMINISTRATOR: 'Administrator'
};

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data'
};