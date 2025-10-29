import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordStrength from '../common/PasswordStrength';
import { useToast } from '../common/Toast';
import { createUser } from '../../services/adminService';
import { validatePassword, isValidEmail, isValidUsername } from '../../utils/validation';
import { ROLES } from '../../utils/constants';
import { User, Mail, Shield, Lock } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'Student',
    password: '',
    sendEmail: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!isValidUsername(formData.username)) {
      newErrors.username = 'Username must be 3-50 characters (letters, numbers, -, _)';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Only validate password if not sending email
    if (!formData.sendEmail) {
      if (!formData.password) {
        newErrors.password = 'Password is required when not sending email';
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        sendEmail: formData.sendEmail
      };

      if (!formData.sendEmail && formData.password) {
        userData.password = formData.password;
      }

      const response = await createUser(userData);
      
      if (response.success) {
        toast.success('User created successfully!');
        handleClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      role: 'Student',
      password: '',
      sendEmail: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User"
      size="lg"
    >
      <div className="space-y-5">
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A new user account will be created. If "Send email" is checked, 
            the user will receive their credentials via email.
          </p>
        </div>

        {/* Username */}
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
          error={errors.username}
          icon={<User size={20} />}
          required
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          error={errors.email}
          icon={<Mail size={20} />}
          required
        />

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent bg-white"
            >
              {Object.values(ROLES).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select the access level for this user
          </p>
        </div>

        {/* Send Email Checkbox */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="sendEmail"
              name="sendEmail"
              checked={formData.sendEmail}
              onChange={handleChange}
              className="w-5 h-5 text-[#193869] rounded focus:ring-[#193869] mt-0.5"
            />
            <div className="flex-1">
              <label htmlFor="sendEmail" className="text-sm font-medium text-gray-800 cursor-pointer">
                Send account credentials via email (Recommended)
              </label>
              <p className="text-xs text-gray-600 mt-1">
                The user will receive an email with their username and a secure temporary password.
              </p>
            </div>
          </div>
        </div>

        {/* Password Field (only shown if sendEmail is false) */}
        {!formData.sendEmail && (
          <div>
            <Input
              label="Temporary Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter temporary password"
              error={errors.password}
              icon={<Lock size={20} />}
              required
            />
            <PasswordStrength password={formData.password} />
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Make sure to securely communicate this password to the user.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
          >
            Create User
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateUserModal;