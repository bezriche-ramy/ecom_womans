import React from 'react';
import { FaShippingFast, FaShieldAlt, FaHeadset, FaUndo, FaGift, FaCreditCard } from 'react-icons/fa';
import styles from './Features.module.css';

const Features = ({ currentLanguage = 'fr' }) => {
  const featuresData = {
    fr: [
      {
        id: 1,
        icon: FaShippingFast,
        title: 'Livraison Gratuite',
        description: 'Livraison gratuite sur toutes les commandes de plus de 5000 DZD'
      },
      {
        id: 2,
        icon: FaShieldAlt,
        title: 'Garantie Qualité',
        description: 'Produits de haute qualité avec garantie de satisfaction'
      },
      {
        id: 3,
        icon: FaHeadset,
        title: 'Support 24/7',
        description: 'Service client disponible 7j/7 pour vous accompagner'
      },
      {
        id: 4,
        icon: FaUndo,
        title: 'Retour Facile',
        description: 'Retour et échange gratuits sous 30 jours'
      },
      {
        id: 5,
        icon: FaGift,
        title: 'Emballage Cadeau',
        description: 'Emballage cadeau gratuit pour toutes vos commandes'
      },
      {
        id: 6,
        icon: FaCreditCard,
        title: 'Paiement Sécurisé',
        description: 'Transactions 100% sécurisées et protection des données'
      }
    ],
    ar: [
      {
        id: 1,
        icon: FaShippingFast,
        title: 'توصيل مجاني',
        description: 'توصيل مجاني لجميع الطلبات أكثر من 5000 دج'
      },
      {
        id: 2,
        icon: FaShieldAlt,
        title: 'ضمان الجودة',
        description: 'منتجات عالية الجودة مع ضمان الرضا'
      },
      {
        id: 3,
        icon: FaHeadset,
        title: 'دعم 24/7',
        description: 'خدمة العملاء متاحة 7 أيام في الأسبوع'
      },
      {
        id: 4,
        icon: FaUndo,
        title: 'إرجاع سهل',
        description: 'إرجاع واستبدال مجاني خلال 30 يوماً'
      },
      {
        id: 5,
        icon: FaGift,
        title: 'تغليف هدايا',
        description: 'تغليف هدايا مجاني لجميع طلباتك'
      },
      {
        id: 6,
        icon: FaCreditCard,
        title: 'دفع آمن',
        description: 'معاملات آمنة 100% وحماية البيانات'
      }
    ],
    en: [
      {
        id: 1,
        icon: FaShippingFast,
        title: 'Free Shipping',
        description: 'Free delivery on all orders over 5000 DZD'
      },
      {
        id: 2,
        icon: FaShieldAlt,
        title: 'Quality Guarantee',
        description: 'High-quality products with satisfaction guarantee'
      },
      {
        id: 3,
        icon: FaHeadset,
        title: '24/7 Support',
        description: 'Customer service available 7 days a week'
      },
      {
        id: 4,
        icon: FaUndo,
        title: 'Easy Returns',
        description: 'Free return and exchange within 30 days'
      },
      {
        id: 5,
        icon: FaGift,
        title: 'Gift Wrapping',
        description: 'Free gift wrapping for all your orders'
      },
      {
        id: 6,
        icon: FaCreditCard,
        title: 'Secure Payment',
        description: '100% secure transactions and data protection'
      }
    ]
  };

  const sectionTitles = {
    fr: 'Pourquoi Choisir Blossom ?',
    ar: 'لماذا تختارين بلوسوم؟',
    en: 'Why Choose Blossom?'
  };

  const features = featuresData[currentLanguage] || featuresData.fr;

  return (
    <section className={styles.featuresSection} role="region" aria-label="Features">
      <div className={styles.container}>
        <h2 className={styles.title}>{sectionTitles[currentLanguage]}</h2>
        
        <div className={styles.featuresGrid}>
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.id} 
                className={styles.featureCard}
                role="article"
                tabIndex={0}
              >
                <div className={styles.iconContainer}>
                  <IconComponent className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
