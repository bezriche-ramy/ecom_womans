import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './Navigation.module.css';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';

const categories = {
  fr: ['Accueil', 'Robes', 'Hauts', 'Bas', 'Accessoires', 'Soldes'],
  ar: ['الرئيسية', 'فساتين', 'قمصان', 'بناطيل', 'إكسسوارات', 'تخفيضات']
};

const categoryLinks = {
  fr: ['/', '/robes', '/hauts', '/bas', '/accessoires', '/soldes'],
  ar: ['/', '/dresses', '/tops', '/pants', '/accessories', '/sale']
};

const Navigation = ({
  isLoggedIn = false,
  onLanguageChange,
  currentLanguage = 'fr',
}) => {
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();
  const [language, setLanguage] = useState(currentLanguage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cartItemCount = getCartItemCount();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
    if (onLanguageChange) onLanguageChange(language);
  }, [language, onLanguageChange]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <nav className={`${styles.navigation} ${language === 'ar' ? styles.rtl : ''}`}>
      <div className={styles.navContainer}>
        <div className={styles.logo} onClick={handleLogoClick} tabIndex={0} aria-label="Blossom Home">
          <img src="/blosom_logo.jpeg" alt="Blossom Logo" className={styles.logoImg} />
          <span className={styles.logoText}>Blossom</span>
        </div>
        {!isMobile && (
          <ul className={styles.menu}>
            {categories[language].map((cat, idx) => (
              <li key={cat}>
                <a href={categoryLinks[language][idx]}>{cat}</a>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.actions}>
          <LanguageSwitcher language={language} onLanguageChange={handleLanguageChange} />
          <button 
            onClick={handleCartClick}
            className={styles.iconBtn} 
            aria-label={language === 'ar' ? 'عربة التسوق' : 'Panier'}
          >
            <FaShoppingCart />
            {cartItemCount > 0 && <span className={styles.cartCount}>{cartItemCount}</span>}
          </button>
          {isMobile && (
            <button
              className={styles.mobileMenuBtn}
              aria-label={isMobileMenuOpen ? (language === 'ar' ? 'إغلاق القائمة' : 'Fermer le menu') : (language === 'ar' ? 'فتح القائمة' : 'Ouvrir le menu')}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
      </div>
      {isMobile && (
        <MobileMenu
          open={isMobileMenuOpen}
          onClose={toggleMobileMenu}
          categories={categories[language]}
          categoryLinks={categoryLinks[language]}
          language={language}
        />
      )}
    </nav>
  );
};

export default Navigation;
