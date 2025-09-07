import React from 'react';
import styles from './Navigation.module.css';

const MobileMenu = ({ open, onClose, categories, categoryLinks, language }) => {
  if (!open) return null;
  return (
    <div className={styles.mobileMenuBackdrop} onClick={onClose}>
      <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
        <ul>
          {categories.map((cat, idx) => (
            <li key={cat}>
              <a href={categoryLinks[idx]} onClick={onClose}>{cat}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MobileMenu;
