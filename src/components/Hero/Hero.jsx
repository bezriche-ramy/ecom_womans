import React, { useState, useEffect } from 'react';
import styles from './Hero.module.css';

const heroContent = {
  fr: {
    headline: "Découvrez la Nouvelle Collection Blossom",
    subheading: "Élégance et Style Féminin",
    description: "Des vêtements féminins tendance qui révèlent votre beauté naturelle",
    ctaButton: "Découvrir la Collection"
  },
  ar: {
    headline: "اكتشفي مجموعة بلوسوم الجديدة",
    subheading: "الأناقة والأسلوب النسائي",
    description: "ملابس نسائية عصرية تبرز جمالك الطبيعي",
    ctaButton: "اكتشفي المجموعة"
  }
};

const Hero = ({ currentLanguage = 'fr' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const content = heroContent[currentLanguage];

  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={`${styles.heroContent} ${isLoaded ? styles.fadeIn : ''} ${currentLanguage === 'ar' ? styles.rtl : ''}`}>
        <h1 className={styles.headline}>{content.headline}</h1>
        <h2 className={styles.subheading}>{content.subheading}</h2>
        <p className={styles.description}>{content.description}</p>
        <button
          className={styles.ctaButton}
          onClick={() => window.location.href = '/products'}
          aria-label={content.ctaButton}
        >
          {content.ctaButton}
        </button>
      </div>
    </section>
  );
};

export default Hero;
