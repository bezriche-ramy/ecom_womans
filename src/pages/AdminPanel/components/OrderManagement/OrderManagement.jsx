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
  FaExclamationTriangle
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Order Management</h2>
          <p>Manage and track all customer orders</p>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.exportButton}
            onClick={handleExport}
            disabled={isExporting}
          >
            <FaDownload />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            className={styles.refreshButton}
            onClick={loadOrders}
            disabled={isLoading}
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
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
            className={styles.filterSelect}
          >
            {dateRanges.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showFilters && (
        <div className={styles.expandedFilters}>
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
      )}

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.noData}>
            <FaExclamationTriangle />
            <h3>No Orders Found</h3>
            <p>No orders match your current filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className={styles.sortable}>
                  Order ID
                  <FaSort />
                </th>
                <th onClick={() => handleSort('customer_name')} className={styles.sortable}>
                  Customer
                  <FaSort />
                </th>
                <th>Items</th>
                <th onClick={() => handleSort('total_price')} className={styles.sortable}>
                  Total
                  <FaSort />
                </th>
                <th onClick={() => handleSort('status')} className={styles.sortable}>
                  Status
                  <FaSort />
                </th>
                <th onClick={() => handleSort('created_at')} className={styles.sortable}>
                  Date
                  <FaSort />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className={styles.orderRow}>
                  <td className={styles.orderId}>#{order.id}</td>
                  <td className={styles.customerInfo}>
                    <div className={styles.customerName}>{order.customer_name}</div>
                    <div className={styles.customerEmail}>{order.customer_email}</div>
                  </td>
                  <td className={styles.orderItems}>
                    <div className={styles.itemsPreview}>
                      {order.order_items?.slice(0, 2).map((item, index) => (
                        <div key={index} className={styles.itemPreview}>
                          {item.products?.main_image_url ? (
                            <img 
                              src={item.products.main_image_url} 
                              alt={item.products?.name || 'Product'} 
                              className={styles.itemImage}
                            />
                          ) : (
                            <div className={styles.noImage}>?</div>
                          )}
                          <span className={styles.itemName}>
                            {item.products?.name || 'Unknown Product'}
                          </span>
                          <span className={styles.itemQuantity}>×{item.quantity}</span>
                        </div>
                      ))}
                      {order.order_items?.length > 2 && (
                        <div className={styles.moreItems}>
                          +{order.order_items.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.totalPrice}>
                    {formatCurrency(order.total_price)}
                  </td>
                  <td className={styles.status}>
                    <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                  </td>
                  <td className={styles.orderDate}>
                    {formatDate(order.created_at || order.order_date)}
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => setSelectedOrder(order)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={styles.statusSelect}
                      title="Update Status"
                    >
                      {statusOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
