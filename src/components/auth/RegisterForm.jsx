import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button, Card, Input, Select, Alert } from '../ui/index.js';

/**
 * RegisterForm component with role selection and validation
 */
export default function RegisterForm({ onSwitchToLogin }) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    sport: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sports = [
    { value: 'cricket', label: 'Cricket' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' }
  ];

  /**
   * Handle input changes and clear related errors
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear sport field when switching from player to coach
    if (name === 'role' && value === 'coach') {
      setFormData(prev => ({
        ...prev,
        sport: ''
      }));
      if (errors.sport) {
        setErrors(prev => ({
          ...prev,
          sport: ''
        }));
      }
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (formData.role === 'player' && !formData.sport) {
      newErrors.sport = 'Please select your sport';
    }

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(
        formData.email,
        formData.password,
        formData.name.trim(),
        formData.role,
        formData.role === 'player' ? formData.sport : null
      );
      // Navigation will be handled by the parent component based on auth state
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card variant="elevated" padding="lg" className="backdrop-blur-sm">
        <Card.Header className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <Card.Title className="text-2xl mb-2">Create Account</Card.Title>
          <p className="text-gray-600">Join our sports performance platform</p>
        </Card.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
            disabled={isSubmitting || loading}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isSubmitting || loading}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Min. 6 characters"
              disabled={isSubmitting || loading}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm password"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <Select
            name="role"
            label="I am a..."
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            disabled={isSubmitting || loading}
            required
          >
            <option value="">Select your role</option>
            <option value="coach">🏃‍♂️ Coach</option>
            <option value="player">⚽ Player</option>
          </Select>

          {formData.role === 'player' && (
            <div className="animate-slide-up">
              <Select
                name="sport"
                label="Sport"
                value={formData.sport}
                onChange={handleChange}
                error={errors.sport}
                disabled={isSubmitting || loading}
                required
              >
                <option value="">Select your sport</option>
                {sports.map(sport => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {errors.submit && (
            <Alert variant="error" className="animate-slide-up">
              {errors.submit}
            </Alert>
          )}

          <Button
            type="submit"
            variant="success"
            size="lg"
            disabled={isSubmitting || loading}
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Card.Footer className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline transition-colors duration-200"
              disabled={isSubmitting || loading}
            >
              Sign in here
            </button>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}