import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaFilter, 
  FaDownload,
  FaSync,
  FaSort,
  FaCalendarAlt,
  FaCreditCard,
  FaShippingFast,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaBox,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import OrderDetailsModal from './OrderDetailsModal';
import { getOrders, updateOrderStatus, exportOrdersToCSV } from '../../../../services/adminService';
import styles from './OrderManagement.module.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('order_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const ordersPerPage = 15;

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Payments' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    loadOrders();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, paymentFilter, orders]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { orders: fetchedOrders, totalCount, totalPages } = await getOrders(
        currentPage,
        ordersPerPage,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder
      );
      
      setOrders(fetchedOrders);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders. Please check your database connection.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at || order.order_date);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at || order.order_date);
            return orderDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at || order.order_date);
            return orderDate >= monthAgo;
          });
          break;
        default:
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Status updated successfully
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportOrdersToCSV({
        search: searchTerm,
        status: statusFilter,
        dateFilter,
        paymentFilter
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      setError('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className={styles.statusIconPending} />;
      case 'processing':
        return <FaSync className={styles.statusIconProcessing} />;
      case 'shipped':
        return <FaShippingFast className={styles.statusIconShipped} />;
      case 'delivered':
        return <FaCheck className={styles.statusIconDelivered} />;
      case 'cancelled':
        return <FaTimes className={styles.statusIconCancelled} />;
      default:
        return <FaExclamationTriangle className={styles.statusIconDefault} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (error) {
    return (
      <div className={styles.error}>
        <FaExclamationTriangle />
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
        <button onClick={loadOrders} className={styles.retryButton}>
          <FaSync />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.orderManagement}>
      {/* Stats Dashboard */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBox />
          </div>
          <div className={styles.statContent}>
            <h3>{filteredOrders.length}</h3>
            <p>Total Orders</p>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp />
            <span>+12%</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{new Set(filteredOrders.map(o => o.customer_name)).size}</h3>
            <p>Customers</p>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp />
            <span>+8%</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaDollarSign />
          </div>
          <div className={styles.statContent}>
            <h3>{formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0))}</h3>
            <p>Total Revenue</p>
          </div>
          <div className={styles.statTrend}>
            <FaArrowUp />
            <span>+15%</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <h3>{filteredOrders.filter(o => o.status === 'delivered').length}</h3>
            <p>Completed</p>
          </div>
          <div className={styles.statTrend}>
            <FaArrowDown />
            <span>-3%</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Order Management</h1>
          <p className={styles.subtitle}>Manage and track all customer orders efficiently</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting}
          >
            <FaDownload />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
          <button 
            className={styles.refreshBtn}
            onClick={loadOrders}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders, customers, or IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterChips}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterChip}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.filterChip}
          >
            {dateRanges.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            className={`${styles.filterToggleBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            More Filters
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className={styles.expandedFilters}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={styles.filterSelect}
              >
                {paymentMethods.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      <div className={styles.ordersContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <h3>Loading Orders...</h3>
            <p>Please wait while we fetch your orders</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaBox />
            </div>
            <h3>No Orders Found</h3>
            <p>No orders match your current filters. Try adjusting your search criteria.</p>
            <button className={styles.clearFiltersBtn} onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
              setPaymentFilter('all');
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {filteredOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.orderInfo}>
                    <h4 className={styles.orderId}>#{order.id}</h4>
                    <span className={styles.orderDate}>
                      {formatDate(order.created_at || order.order_date)}
                    </span>
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                </div>

                <div className={styles.customerSection}>
                  <div className={styles.customerAvatar}>
                    {order.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.customerInfo}>
                    <h5 className={styles.customerName}>{order.customer_name}</h5>
                    <p className={styles.customerPhone}>{order.customer_phone}</p>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.order_items?.slice(0, 3).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      {item.products?.main_image_url ? (
                        <img 
                          src={item.products.main_image_url} 
                          alt={item.products?.name || 'Product'} 
                          className={styles.itemImage}
                        />
                      ) : (
                        <div className={styles.itemPlaceholder}>
                          <FaBox />
                        </div>
                      )}
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>
                          {item.products?.name || 'Unknown Product'}
                        </span>
                        <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {order.order_items?.length > 3 && (
                    <div className={styles.moreItems}>
                      +{order.order_items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.totalAmount}>
                    <span className={styles.totalLabel}>Total:</span>
                    <span className={styles.totalValue}>
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>
                  
                  <div className={styles.cardActions}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={styles.statusSelector}
                      title="Update Status"
                    >
                      {statusOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default OrderManagement;
