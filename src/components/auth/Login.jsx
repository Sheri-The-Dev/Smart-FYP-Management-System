import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="username"
          label="Username or Email"
          placeholder="Enter your username or email"
          {...register('username', { required: 'Username or email is required' })}
          error={errors.username?.message}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link 
            to="/forgot-password" 
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Login
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Login;