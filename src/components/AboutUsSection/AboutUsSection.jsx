import React from 'react';
import styles from './AboutUsSection.module.css';
import { FaTshirt, FaLeaf, FaSmile, FaShippingFast } from 'react-icons/fa';

const AboutUsSection = ({ 
  heading = "About Blossom",
  description = "At Blossom, we believe every woman deserves to feel confident and beautiful. Our mission is to empower women through carefully curated, stylish apparel made with sustainability and care. We're committed to offering inclusive sizing, on-trend fashion, and exceptional customer service that makes your shopping experience as delightful as our designs.",
  imageSrc = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  imageAlt = "A styled fashion boutique showcasing elegant women's clothing and accessories"
}) => {
  return (
    <section className={styles.aboutUsSection}>
      <div className={styles.container}>
        <div className={styles.textContent}>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.description}>
            {description}
          </p>
          <ul className={styles.highlights}>
            <li className={styles.highlight}>
              <FaTshirt className={styles.icon} aria-hidden="true" />
              <span>Elegant Designs</span>
            </li>
            <li className={styles.highlight}>
              <FaLeaf className={styles.icon} aria-hidden="true" />
              <span>Sustainable Materials</span>
            </li>
            <li className={styles.highlight}>
              <FaSmile className={styles.icon} aria-hidden="true" />
              <span>Customer First Service</span>
            </li>
            <li className={styles.highlight}>
              <FaShippingFast className={styles.icon} aria-hidden="true" />
              <span>Fast & Reliable Shipping</span>
            </li>
          </ul>
        </div>
        <div className={styles.imageContent}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
