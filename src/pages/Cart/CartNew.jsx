import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../supabaseClient';
import styles from './Cart.module.css';

const Cart = ({ currentLanguage = 'fr' }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Order form state matching new database schema
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: ''
  });

  // Multilingual text
  const texts = {
    fr: {
      cart: 'Panier',
      emptyCart: 'Votre panier est vide',
      continueShopping: 'Continuer les achats',
      quantity: 'Quantité',
      price: 'Prix',
      total: 'Total',
      remove: 'Supprimer',
      proceedToOrder: 'Passer commande',
      orderDetails: 'Finaliser la commande',
      customerName: 'Nom complet',
      customerEmail: 'Email',
      customerPhone: 'Téléphone',
      shippingAddress: 'Adresse de livraison',
      submitOrder: 'Valider la commande',
      backToCart: 'Retour au panier',
      orderSuccess: 'Commande envoyée avec succès!',
      orderSuccessMessage: 'Nous vous contacterons bientôt pour confirmer votre commande.',
      orderError: 'Erreur lors de l\'envoi de la commande',
      required: 'Ce champ est requis',
      invalidEmail: 'Format d\'email invalide',
      size: 'Taille',
      color: 'Couleur',
      clearCart: 'Vider le panier',
      confirmClear: 'Êtes-vous sûr de vouloir vider le panier?'
    },
    ar: {
      cart: 'السلة',
      emptyCart: 'سلتك فارغة',
      continueShopping: 'متابعة التسوق',
      quantity: 'الكمية',
      price: 'السعر',
      total: 'المجموع',
      remove: 'حذف',
      proceedToOrder: 'إتمام الطلب',
      orderDetails: 'إنهاء الطلب',
      customerName: 'الاسم الكامل',
      customerEmail: 'البريد الإلكتروني',
      customerPhone: 'رقم الهاتف',
      shippingAddress: 'عنوان التسليم',
      submitOrder: 'تأكيد الطلب',
      backToCart: 'العودة إلى السلة',
      orderSuccess: 'تم إرسال الطلب بنجاح!',
      orderSuccessMessage: 'سنتواصل معك قريباً لتأكيد طلبك.',
      orderError: 'خطأ في إرسال الطلب',
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'تنسيق البريد الإلكتروني غير صحيح',
      size: 'المقاس',
      color: 'اللون',
      clearCart: 'إفراغ السلة',
      confirmClear: 'هل أنت متأكد من إفراغ السلة؟'
    },
    en: {
      cart: 'Cart',
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      remove: 'Remove',
      proceedToOrder: 'Proceed to Order',
      orderDetails: 'Complete Order',
      customerName: 'Full Name',
      customerEmail: 'Email',
      customerPhone: 'Phone',
      shippingAddress: 'Shipping Address',
      submitOrder: 'Submit Order',
      backToCart: 'Back to Cart',
      orderSuccess: 'Order submitted successfully!',
      orderSuccessMessage: 'We will contact you soon to confirm your order.',
      orderError: 'Error submitting order',
      required: 'This field is required',
      invalidEmail: 'Invalid email format',
      size: 'Size',
      color: 'Color',
      clearCart: 'Clear Cart',
      confirmClear: 'Are you sure you want to clear the cart?'
    }
  };

  const t = texts[currentLanguage] || texts.fr;

  const getProductName = (item) => {
    switch (currentLanguage) {
      case 'ar':
        return item.name_ar || item.name;
      case 'fr':
        return item.name_fr || item.name;
      case 'en':
        return item.name;
      default:
        return item.name;
    }
  };

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemoveItem = (cartItemId) => {
    removeFromCart(cartItemId);
  };

  const handleClearCart = () => {
    if (window.confirm(t.confirmClear)) {
      clearCart();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!orderForm.customerName.trim()) {
      errors.customerName = t.required;
    }
    
    if (!orderForm.customerEmail.trim()) {
      errors.customerEmail = t.required;
    } else if (!/\S+@\S+\.\S+/.test(orderForm.customerEmail)) {
      errors.customerEmail = t.invalidEmail;
    }
    
    if (!orderForm.customerPhone.trim()) {
      errors.customerPhone = t.required;
    }
    
    if (!orderForm.shippingAddress.trim()) {
      errors.shippingAddress = t.required;
    }
    
    return errors;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setOrderError(errors);
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Create order with new schema - Orders table
      const orderData = {
        customer_name: orderForm.customerName,
        customer_email: orderForm.customerEmail,
        customer_phone: orderForm.customerPhone,
        shipping_address: orderForm.shippingAddress,
        total_amount: parseFloat(getCartTotal()),
        status: 'pending'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Create order items - Order_Items table
      const orderItems = cart.items.map(item => ({
        order_id: order.order_id,
        product_id: item.productId, // This should be UUID in your schema
        quantity: parseInt(item.quantity),
        price_each: parseFloat(item.price)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // Try to clean up the order if items creation failed
        await supabase
          .from('orders')
          .delete()
          .eq('order_id', order.order_id);
        
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Success
      setOrderSubmitted(true);
      clearCart();
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setOrderError({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (orderSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>{t.orderSuccess}</h2>
          <p className={styles.successMessage}>{t.orderSuccessMessage}</p>
          <button 
            className={styles.continueButton}
            onClick={() => navigate('/')}
          >
            {t.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  if (showOrderForm) {
    return (
      <div className={styles.container}>
        <div className={styles.orderForm}>
          <h2 className={styles.orderTitle}>{t.orderDetails}</h2>
          
          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h3>{t.cart}</h3>
            {cart.items.map((item) => (
              <div key={item.cartItemId} className={styles.summaryItem}>
                <img src={item.mainImageUrl} alt={getProductName(item)} className={styles.summaryImage} />
                <div className={styles.summaryDetails}>
                  <span className={styles.summaryName}>{getProductName(item)}</span>
                  <span className={styles.summaryMeta}>
                    {item.selectedSize && `${t.size}: ${item.selectedSize}`}
                    {item.selectedSize && item.selectedColor && ' | '}
                    {item.selectedColor && `${t.color}: ${item.selectedColor}`}
                  </span>
                  <span className={styles.summaryPrice}>
                    {item.quantity} × {item.price} DZD = {item.quantity * item.price} DZD
                  </span>
                </div>
              </div>
            ))}
            <div className={styles.summaryTotal}>
              <strong>{t.total}: {getCartTotal()} DZD</strong>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="customerName">{t.customerName} *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={orderForm.customerName}
                onChange={handleInputChange}
                className={orderError?.customerName ? styles.error : ''}
                required
              />
              {orderError?.customerName && (
                <span className={styles.errorText}>{orderError.customerName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customerEmail">{t.customerEmail} *</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={orderForm.customerEmail}
                onChange={handleInputChange}
                className={orderError?.customerEmail ? styles.error : ''}
                required
              />
              {orderError?.customerEmail && (
                <span className={styles.errorText}>{orderError.customerEmail}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customerPhone">{t.customerPhone} *</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={orderForm.customerPhone}
                onChange={handleInputChange}
                className={orderError?.customerPhone ? styles.error : ''}
                required
              />
              {orderError?.customerPhone && (
                <span className={styles.errorText}>{orderError.customerPhone}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="shippingAddress">{t.shippingAddress} *</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                value={orderForm.shippingAddress}
                onChange={handleInputChange}
                className={orderError?.shippingAddress ? styles.error : ''}
                rows="3"
                required
              />
              {orderError?.shippingAddress && (
                <span className={styles.errorText}>{orderError.shippingAddress}</span>
              )}
            </div>

            {orderError?.submit && (
              <div className={styles.submitError}>
                {t.orderError}: {orderError.submit}
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className={styles.backButton}
              >
                {t.backToCart}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Envoi...' : t.submitOrder}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cart}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>{t.cart}</h1>
          {cart.items.length > 0 && (
            <button onClick={handleClearCart} className={styles.clearButton}>
              {t.clearCart}
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>{t.emptyCart}</h2>
            <button 
              className={styles.continueButton}
              onClick={() => navigate('/')}
            >
              {t.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {cart.items.map((item) => (
                <div key={item.cartItemId} className={styles.cartItem}>
                  <img 
                    src={item.mainImageUrl} 
                    alt={getProductName(item)}
                    className={styles.itemImage}
                  />
                  
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{getProductName(item)}</h3>
                    
                    <div className={styles.itemMeta}>
                      {item.selectedSize && (
                        <span className={styles.metaItem}>
                          {t.size}: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className={styles.metaItem}>
                          {t.color}: {item.selectedColor}
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.itemPrice}>
                      {item.price} DZD
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                        className={styles.quantityButton}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className={styles.itemTotal}>
                      {item.quantity * item.price} DZD
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.cartItemId)}
                      className={styles.removeButton}
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartFooter}>
              <div className={styles.cartTotal}>
                <span className={styles.totalLabel}>{t.total}:</span>
                <span className={styles.totalAmount}>{getCartTotal()} DZD</span>
              </div>
              
              <div className={styles.cartActions}>
                <button 
                  className={styles.continueButton}
                  onClick={() => navigate('/')}
                >
                  {t.continueShopping}
                </button>
                <button 
                  className={styles.orderButton}
                  onClick={() => setShowOrderForm(true)}
                >
                  {t.proceedToOrder}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
