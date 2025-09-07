import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../supabaseClient';
import styles from './ProductGrid.module.css';

const ProductGrid = ({ currentLanguage = 'fr' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const PRODUCTS_PER_PAGE = 4;

  const errorMessages = {
    fr: 'Erreur lors du chargement des produits',
    ar: 'خطأ في تحميل المنتجات',
    en: 'Error loading products'
  };

  const outOfStockMessages = {
    fr: 'Rupture de stock',
    ar: 'نفدت الكمية',
    en: 'Out of Stock'
  };

  const addToCartMessages = {
    fr: 'Ajouter au panier',
    ar: 'أضف إلى السلة',
    en: 'Add to Cart'
  };

  const loadMoreMessages = {
    fr: 'Charger plus',
    ar: 'تحميل المزيد',
    en: 'Load More'
  };

  useEffect(() => {
    fetchInitialProducts();
  }, []);

  const fetchInitialProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .range(0, PRODUCTS_PER_PAGE - 1);

      if (error) throw error;
      
      const fetchedProducts = data || [];
      setProducts(fetchedProducts);
      setOffset(PRODUCTS_PER_PAGE);
      setHasMore(fetchedProducts.length === PRODUCTS_PER_PAGE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    try {
      setLoadingMore(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .range(offset, offset + PRODUCTS_PER_PAGE - 1);

      if (error) throw error;

      const newProducts = data || [];
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
      setOffset(prevOffset => prevOffset + PRODUCTS_PER_PAGE);
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const getProductName = (product) => {
    switch (currentLanguage) {
      case 'ar':
        return product.name_ar || product.name;
      case 'fr':
        return product.name_fr || product.name;
      default:
        return product.name;
    }
  };

  const getProductDescription = (product) => {
    switch (currentLanguage) {
      case 'ar':
        return product.description_ar || product.description;
      case 'fr':
        return product.description_fr || product.description;
      default:
        return product.description;
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine}></div>
        <div className={styles.skeletonLine}></div>
        <div className={styles.skeletonPrice}></div>
        <div className={styles.skeletonButton}></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className={styles.productGrid}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className={styles.productGrid}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{errorMessages[currentLanguage] || errorMessages.en}</p>
            <button onClick={fetchInitialProducts} className={styles.retryButton}>
              {currentLanguage === 'fr' ? 'Réessayer' : 
               currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productGrid} role="region" aria-label="Product Grid">
      <div className={styles.container}>
        <div className={styles.grid} role="grid">
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
              role="gridcell"
              onClick={() => handleProductClick(product.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProductClick(product.id);
                }
              }}
              tabIndex={0}
            >
              <div className={styles.imageContainer}>
                <img
                  src={product.main_image_url}
                  alt={getProductName(product)}
                  className={styles.productImage}
                  loading="lazy"
                />
                {product.stock === 0 && (
                  <div className={styles.outOfStockBadge}>
                    {outOfStockMessages[currentLanguage] || outOfStockMessages.en}
                  </div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{getProductName(product)}</h3>
                <p className={styles.productDescription}>
                  {getProductDescription(product)}
                </p>
                <div className={styles.productMeta}>
                  <span className={styles.price}>{product.price} DZD</span>
                  <div className={styles.details}>
                    {product.size && (
                      <span className={styles.size}>
                        {currentLanguage === 'fr' ? 'Taille:' : 
                         currentLanguage === 'ar' ? 'المقاس:' : 'Size:'} {product.size}
                      </span>
                    )}
                    {product.color && (
                      <span className={styles.color}>
                        {currentLanguage === 'fr' ? 'Couleur:' : 
                         currentLanguage === 'ar' ? 'اللون:' : 'Color:'} {product.color}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={`${styles.addToCartBtn} ${product.stock === 0 ? styles.disabled : ''}`}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.stock === 0}
                  aria-label={`${addToCartMessages[currentLanguage] || addToCartMessages.en} ${getProductName(product)}`}
                >
                  {product.stock === 0 
                    ? (outOfStockMessages[currentLanguage] || outOfStockMessages.en)
                    : (addToCartMessages[currentLanguage] || addToCartMessages.en)
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More Section */}
        {(hasMore || loadingMore) && (
          <div className={styles.loadMoreSection}>
            {loadingMore ? (
              <div className={styles.loadingMore}>
                <div className={styles.spinner}></div>
                <span>{currentLanguage === 'fr' ? 'Chargement...' : 
                       currentLanguage === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : (
              <button 
                className={styles.loadMoreButton}
                onClick={loadMoreProducts}
                aria-label={loadMoreMessages[currentLanguage] || loadMoreMessages.en}
              >
                {loadMoreMessages[currentLanguage] || loadMoreMessages.en}
              </button>
            )}
          </div>
        )}

        {/* Error message for load more failures */}
        {error && products.length > 0 && (
          <div className={styles.loadMoreError}>
            <p>{errorMessages[currentLanguage] || errorMessages.en}</p>
            <button onClick={loadMoreProducts} className={styles.retryButton}>
              {currentLanguage === 'fr' ? 'Réessayer' : 
               currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
