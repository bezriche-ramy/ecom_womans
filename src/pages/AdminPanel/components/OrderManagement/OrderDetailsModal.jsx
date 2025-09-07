import React from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';
import styles from './OrderDetailsModal.module.css';

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  if (!order) return null;

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'credit_card': return <FaCreditCard />;
      case 'paypal': return <FaPaypal />;
      case 'cash': return <FaMoneyBillWave />;
      default: return <FaCreditCard />;
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'cash': return 'Cash on Delivery';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped;
      case 'delivered': return styles.statusDelivered;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 9.99; // Fixed shipping cost
  const tax = itemsSubtotal * 0.08; // 8% tax

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Order Details</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Order Info Section */}
          <div className={styles.section}>
            <h3>Order Information</h3>
            <div className={styles.orderInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Order ID:</span>
                <span className={styles.value}>{order.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  className={`${styles.statusSelect} ${getStatusColor(order.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Order Date:</span>
                <span className={styles.value}>{formatDate(order.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Last Updated:</span>
                <span className={styles.value}>{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info Section */}
          <div className={styles.section}>
            <h3>Customer Information</h3>
            <div className={styles.customerInfo}>
              <div className={styles.infoRow}>
                <FaUser className={styles.icon} />
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{order.customerName}</span>
              </div>
              <div className={styles.infoRow}>
                <FaEnvelope className={styles.icon} />
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{order.customerEmail}</span>
              </div>
              <div className={styles.infoRow}>
                <FaPhone className={styles.icon} />
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{order.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className={styles.section}>
            <h3>Shipping Address</h3>
            <div className={styles.addressInfo}>
              <FaMapMarkerAlt className={styles.addressIcon} />
              <div className={styles.addressDetails}>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className={styles.section}>
            <h3>Order Items</h3>
            <div className={styles.itemsList}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemDetails}>
                    <h4>{item.name}</h4>
                    <div className={styles.itemSpecs}>
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    <span className={styles.unitPrice}>${item.price.toFixed(2)} each</span>
                    <span className={styles.totalPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Total Section */}
          <div className={styles.section}>
            <h3>Payment & Total</h3>
            <div className={styles.paymentInfo}>
              <div className={styles.infoRow}>
                {getPaymentIcon(order.paymentMethod)}
                <span className={styles.label}>Payment Method:</span>
                <span className={styles.value}>{getPaymentMethodName(order.paymentMethod)}</span>
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeFooterButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
