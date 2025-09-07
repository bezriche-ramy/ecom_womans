import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import { useAuth } from './hooks/useAuth';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { isAuthenticated, user, login, logout, checkSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkSession();
      setIsLoading(false);
    };
    initializeAuth();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      {!isAuthenticated ? (
        <LoginPage onLogin={login} />
      ) : (
        <Dashboard user={user} onLogout={logout} />
      )}
    </div>
  );
};

export default AdminPanel;
