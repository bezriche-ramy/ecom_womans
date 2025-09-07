import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../supabaseClient';
import styles from './ProductDetail.module.css';

const ProductDetail = ({ currentLanguage = 'fr' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Multilingual text
  const texts = {
    fr: {
      backToHome: 'Retour à l\'accueil',
      addToCart: 'Ajouter au panier',
      outOfStock: 'Rupture de stock',
      size: 'Taille',
      color: 'Couleur',
      stock: 'En stock',
      category: 'Catégorie',
      productNotFound: 'Produit non trouvé',
      loadingError: 'Erreur lors du chargement du produit',
      retry: 'Réessayer',
      loading: 'Chargement...',
      inStock: 'articles en stock',
      lowStock: 'Stock limité',
      available: 'Disponible'
    },
    ar: {
      backToHome: 'العودة إلى الصفحة الرئيسية',
      addToCart: 'أضف إلى السلة',
      outOfStock: 'نفدت الكمية',
      size: 'المقاس',
      color: 'اللون',
      stock: 'متوفر',
      category: 'الفئة',
      productNotFound: 'المنتج غير موجود',
      loadingError: 'خطأ في تحميل المنتج',
      retry: 'إعادة المحاولة',
      loading: 'جاري التحميل...',
      inStock: 'قطعة متوفرة',
      lowStock: 'كمية محدودة',
      available: 'متوفر'
    },
    en: {
      backToHome: 'Back to Home',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      size: 'Size',
      color: 'Color',
      stock: 'In Stock',
      category: 'Category',
      productNotFound: 'Product not found',
      loadingError: 'Error loading product',
      retry: 'Retry',
      loading: 'Loading...',
      inStock: 'items in stock',
      lowStock: 'Limited stock',
      available: 'Available'
    }
  };

  const t = texts[currentLanguage] || texts.fr;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('not_found');
        } else {
          throw error;
        }
        return;
      }

      setProduct(data);
      // Set default selections
      setSelectedSize(data.size || '');
      setSelectedColor(data.color || '');
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('fetch_error');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    switch (currentLanguage) {
      case 'ar':
        return product.name_ar || product.name;
      case 'fr':
        return product.name_fr || product.name;
      case 'en':
        return product.name;
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
      case 'en':
        return product.description;
      default:
        return product.description;
    }
  };

  const getProductCategory = (product) => {
    switch (currentLanguage) {
      case 'ar':
        return product.category_ar || product.category;
      case 'fr':
        return product.category_fr || product.category;
      case 'en':
        return product.category;
      default:
        return product.category;
    }
  };

  const getAllImages = (product) => {
    const images = [product.main_image_url];
    if (product.image_urls && Array.isArray(product.image_urls)) {
      images.push(...product.image_urls);
    }
    return images.filter(Boolean); // Remove any null/undefined images
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
    setImageLoading(true);
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product, 1, selectedSize, selectedColor);
      // Show success message or redirect to cart
      navigate('/cart');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: t.outOfStock, className: styles.outOfStock };
    } else if (product.stock <= 5) {
      return { text: `${product.stock} ${t.inStock} - ${t.lowStock}`, className: styles.lowStock };
    } else {
      return { text: `${product.stock} ${t.inStock}`, className: styles.inStock };
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.container}>
      <div className={styles.productDetail}>
        <div className={styles.imageSection}>
          <div className={styles.mainImageSkeleton}></div>
          <div className={styles.thumbnailsSkeleton}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.thumbnailSkeleton}></div>
            ))}
          </div>
        </div>
        <div className={styles.productInfo}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonDescription}></div>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonBadges}></div>
          <div className={styles.skeletonButtons}></div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorMessage = ({ type }) => (
    <div className={styles.container}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>
          {type === 'not_found' ? t.productNotFound : t.loadingError}
        </h2>
        <div className={styles.errorActions}>
          <button onClick={handleBackToHome} className={styles.backButton}>
            {t.backToHome}
          </button>
          {type !== 'not_found' && (
            <button onClick={fetchProduct} className={styles.retryButton}>
              {t.retry}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage type={error} />;
  }

  if (!product) {
    return <ErrorMessage type="not_found" />;
  }

  const allImages = getAllImages(product);
  const stockStatus = getStockStatus();

  return (
    <div className={styles.container}>
      <div className={styles.productDetail}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            {imageLoading && (
              <div className={styles.imageLoader}>
                <div className={styles.spinner}></div>
              </div>
            )}
            <img
              src={allImages[selectedImageIndex]}
              alt={getProductName(product)}
              className={styles.mainImage}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
          
          {allImages.length > 1 && (
            <div className={styles.thumbnailsContainer}>
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === selectedImageIndex ? styles.active : ''
                  }`}
                  onClick={() => handleImageSelect(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${getProductName(product)} - Image ${index + 1}`}
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Section */}
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <h1 className={styles.productTitle}>{getProductName(product)}</h1>
            <div className={styles.categoryBadge}>
              {getProductCategory(product)}
            </div>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.price}>{product.price} DZD</span>
            <div className={`${styles.stockStatus} ${stockStatus.className}`}>
              {stockStatus.text}
            </div>
          </div>

          <div className={styles.description}>
            <p>{getProductDescription(product)}</p>
          </div>

          <div className={styles.productAttributes}>
            {product.size && (
              <div className={styles.attribute}>
                <span className={styles.attributeLabel}>{t.size}:</span>
                <span className={styles.attributeValue}>{product.size}</span>
              </div>
            )}
            {product.color && (
              <div className={styles.attribute}>
                <span className={styles.attributeLabel}>{t.color}:</span>
                <span className={styles.attributeValue}>{product.color}</span>
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.backToHomeButton}
              onClick={handleBackToHome}
              aria-label={t.backToHome}
            >
              {t.backToHome}
            </button>
            <button
              className={`${styles.addToCartButton} ${
                product.stock === 0 ? styles.disabled : ''
              }`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={`${t.addToCart} ${getProductName(product)}`}
            >
              {product.stock === 0 ? t.outOfStock : t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
