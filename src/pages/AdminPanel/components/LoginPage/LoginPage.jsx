import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './LoginPage.module.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onLogin(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoText}>Blossom</span>
            <span className={styles.adminText}>Admin Panel</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner}></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.securityNote}>
            🔒 Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
