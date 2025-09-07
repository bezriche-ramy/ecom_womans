import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaStar, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import styles from './ClientReviews.module.css';

const ClientReviews = ({ currentLanguage = 'fr' }) => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sectionTitles = {
    fr: 'Avis de nos Clientes',
    ar: 'آراء عملائنا',
    en: 'Client Reviews'
  };

  const errorMessages = {
    fr: 'Erreur lors du chargement des avis',
    ar: 'خطأ في تحميل التقييمات',
    en: 'Error loading reviews'
  };

  // Mock reviews with Algerian names
  const mockReviews = [
    {
      id: 1,
      client_name: 'Leila Hadj Ahmed',
      rating: 5,
      comment: 'Une collection vraiment sublime ! La qualité des tissus est exceptionnelle et les coupes sont parfaites.',
      date: '2024-12-18',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      client_name: 'Soundous Belkacem',
      rating: 5,
      comment: 'Blossom a transformé ma garde-robe ! Des pièces élégantes qui me correspondent vraiment.',
      date: '2024-12-14',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      client_name: 'Nesrine Bourahla',
      rating: 4,
      comment: 'Service impeccable et designs modernes. Je recommande les yeux fermés !',
      date: '2024-12-12',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      client_name: 'Kahina Moussa',
      rating: 5,
      comment: 'Enfin une marque qui comprend les femmes algériennes ! Qualité au top et style unique.',
      date: '2024-12-09',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 5,
      client_name: 'Djamila Zenati',
      rating: 5,
      comment: 'Mes amies me demandent toujours où je trouve mes vêtements. Blossom est mon secret !',
      date: '2024-12-06',
      avatar: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 6,
      client_name: 'Rania Cherif',
      rating: 5,
      comment: 'Des créations qui allient tradition et modernité. Parfait pour toutes les occasions !',
      date: '2024-12-03',
      avatar: 'https://images.unsplash.com/photo-1488508872907-592763824245?w=150&h=150&fit=crop&crop=face'
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (error) {
        // If table doesn't exist or error, use mock data
        setReviews(mockReviews);
      } else {
        setReviews(data.length > 0 ? data : mockReviews);
      }
    } catch (err) {
      // Fallback to mock data
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <h2 className={styles.title}>{sectionTitles[currentLanguage]}</h2>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <h2 className={styles.title}>{sectionTitles[currentLanguage]}</h2>
          <div className={styles.noReviews}>
            <p>{errorMessages[currentLanguage]}</p>
          </div>
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className={styles.reviewsSection} role="region" aria-label="Client Reviews">
      <div className={styles.container}>
        <h2 className={styles.title}>{sectionTitles[currentLanguage]}</h2>
        
        <div className={styles.carousel}>
          <button
            className={styles.navButton}
            onClick={prevReview}
            aria-label="Previous review"
          >
            <FaAngleLeft />
          </button>

          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <img
                src={currentReview.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentReview.client_name)}&background=e75480&color=fff`}
                alt={currentReview.client_name}
                className={styles.avatar}
              />
              <div className={styles.clientInfo}>
                <h3 className={styles.clientName}>{currentReview.client_name}</h3>
                <div className={styles.rating}>
                  {renderStars(currentReview.rating)}
                </div>
                <span className={styles.date}>
                  {new Date(currentReview.date).toLocaleDateString(
                    currentLanguage === 'fr' ? 'fr-FR' : 'ar-DZ'
                  )}
                </span>
              </div>
            </div>
            <blockquote className={styles.comment}>
              "{currentReview.comment}"
            </blockquote>
          </div>

          <button
            className={styles.navButton}
            onClick={nextReview}
            aria-label="Next review"
          >
            <FaAngleRight />
          </button>
        </div>

        <div className={styles.indicators}>
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToReview(index)}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientReviews;
