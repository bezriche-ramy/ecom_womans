import React from 'react';
import styles from './Navigation.module.css';

const LanguageSwitcher = ({ language, onLanguageChange }) => {
  return (
    <div className={styles.languageSwitcher}>
      <button
        className={language === 'fr' ? styles.activeLang : ''}
        onClick={() => onLanguageChange('fr')}
        aria-label="Français"
      >
        FR
      </button>
      <span className={styles.langDivider}>|</span>
      <button
        className={language === 'ar' ? styles.activeLang : ''}
        onClick={() => onLanguageChange('ar')}
        aria-label="العربية"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
