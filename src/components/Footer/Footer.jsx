import React, { useState } from 'react';
import styles from './Footer.module.css';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaEnvelope } from 'react-icons/fa';

const Footer = ({
  logoText = "Blossom",
  tagline = "Your Style Destination",
  address = "123 Blossom Lane, Fashion District, NYC 10001",
  phone = "(555) 123-BLOOM",
  email = "hello@blossom.com",
  socialLinks = {
    facebook: "https://facebook.com/blossom",
    instagram: "https://instagram.com/blossom",
    twitter: "https://twitter.com/blossom",
    pinterest: "https://pinterest.com/blossom"
  }
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage('Thank you for subscribing!');
      setNewsletterEmail('');
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <h2 className={styles.logo}>{logoText}</h2>
          <p className={styles.tagline}>{tagline}</p>
          <p className={styles.brandDescription}>
            Empowering women through elegant, sustainable fashion with exceptional service.
          </p>
        </div>

        {/* Navigation Links */}
        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Quick Links</h3>
          <nav className={styles.navLinks} role="navigation" aria-label="Footer navigation">
            <a href="/" className={styles.navLink}>Home</a>
            <a href="/products" className={styles.navLink}>Products</a>
            <a href="/about" className={styles.navLink}>About Us</a>
            <a href="/contact" className={styles.navLink}>Contact</a>
            <a href="/faq" className={styles.navLink}>FAQ</a>
          </nav>
        </div>

        {/* Contact Information */}
        <div className={styles.contactSection}>
          <h3 className={styles.sectionTitle}>Contact Info</h3>
          <div className={styles.contactInfo}>
            <p className={styles.contactItem}>{address}</p>
            <p className={styles.contactItem}>
              <a href={`tel:${phone.replace(/\D/g, '')}`} className={styles.contactLink}>
                {phone}
              </a>
            </p>
            <p className={styles.contactItem}>
              <a href={`mailto:${email}`} className={styles.contactLink}>
                {email}
              </a>
            </p>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className={styles.newsletterSection}>
          <h3 className={styles.sectionTitle}>Stay Updated</h3>
          <p className={styles.newsletterDescription}>
            Subscribe to get updates on new arrivals and exclusive offers
          </p>
          <form 
            className={styles.newsletterForm} 
            onSubmit={handleNewsletterSubmit}
            noValidate
          >
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className={styles.emailInput}
                aria-label="Email address for newsletter subscription"
                required
              />
              <button 
                type="submit" 
                className={styles.subscribeButton}
                disabled={isSubmitting}
                aria-label="Subscribe to newsletter"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {message && (
              <p className={`${styles.message} ${message.includes('Thank') ? styles.success : styles.error}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Social Media */}
        <div className={styles.socialSection}>
          <h3 className={styles.sectionTitle}>Follow Us</h3>
          <div className={styles.socialMedia} role="group" aria-label="Social media links">
            <a 
              href={socialLinks.facebook} 
              className={styles.socialLink}
              aria-label="Follow us on Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a 
              href={socialLinks.instagram} 
              className={styles.socialLink}
              aria-label="Follow us on Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a 
              href={socialLinks.twitter} 
              className={styles.socialLink}
              aria-label="Follow us on Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a 
              href={socialLinks.pinterest} 
              className={styles.socialLink}
              aria-label="Follow us on Pinterest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaPinterest />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div className={styles.legalLinks}>
            <a href="/privacy" className={styles.legalLink}>Privacy Policy</a>
            <span className={styles.separator}>|</span>
            <a href="/terms" className={styles.legalLink}>Terms of Service</a>
          </div>
          <p className={styles.copyright}>
            © 2025 Blossom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
