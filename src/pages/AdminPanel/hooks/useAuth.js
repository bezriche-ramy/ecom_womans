import { useState, useCallback } from 'react';
import bcrypt from 'bcryptjs';

const ADMIN_CREDENTIALS = {
  email: 'ramybezriche@gmail.com',
  password: '26012005' // Using plain text for development
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  const login = useCallback(async (email, password) => {
    try {
      // Verify credentials
      if (email !== ADMIN_CREDENTIALS.email) {
        throw new Error('Invalid email address');
      }

      // Simple password comparison for development
      if (password !== ADMIN_CREDENTIALS.password) {
        throw new Error('Invalid password');
      }

      // Create session
      const sessionData = {
        user: { email, role: 'admin' },
        timestamp: Date.now(),
        expiresAt: Date.now() + SESSION_TIMEOUT
      };

      localStorage.setItem('adminSession', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setUser({ email, role: 'admin' });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const checkSession = useCallback(() => {
    try {
      const sessionData = localStorage.getItem('adminSession');
      
      if (!sessionData) {
        return false;
      }

      const session = JSON.parse(sessionData);
      const now = Date.now();

      // Check if session is expired
      if (now > session.expiresAt) {
        logout();
        return false;
      }

      // Extend session if user is active
      session.expiresAt = now + SESSION_TIMEOUT;
      localStorage.setItem('adminSession', JSON.stringify(session));

      setIsAuthenticated(true);
      setUser(session.user);
      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }, [logout]);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkSession
  };
};
