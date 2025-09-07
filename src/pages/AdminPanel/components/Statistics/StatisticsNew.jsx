import React, { useState, useEffect } from 'react';
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaDollarSign, 
  FaWarehouse, 
  FaArrowUp, 
  FaArrowDown,
  FaUsers,
  FaStar,
  FaExclamationTriangle,
  FaSync,
  FaTrendingUp,
  FaTrendingDown,
  FaEye,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar
} from 'react-icons/fa';
import { 
  getDashboardStats, 
  getRevenueChartData, 
  getTopProducts,
  getLowStockProducts 
} from '../../../../services/adminService';
import styles from './Statistics.module.css';

const Statistics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    statusDistribution: {}
  });

  const [chartData, setChartData] = useState({
    revenueChart: [],
    topProducts: [],
    lowStockProducts: []
  });

  // Mock data for demo
  const mockStats = {
    totalProducts: 156,
    totalOrders: 342,
    totalRevenue: 25680.50,
    lowStockItems: 12,
    totalCustomers: 89,
    revenueGrowth: 15.3,
    orderGrowth: 8.7,
    customerGrowth: 12.4,
    statusDistribution: {
      pending: 23,
      processing: 45,
      shipped: 67,
      delivered: 198,
      cancelled: 9
    }
  };

  const mockChartData = {
    revenueChart: [
      { period: 'Jan 2025', revenue: 12450, orders: 67 },
      { period: 'Feb 2025', revenue: 18920, orders: 89 },
      { period: 'Mar 2025', revenue: 22340, orders: 102 },
      { period: 'Apr 2025', revenue: 19870, orders: 95 },
      { period: 'May 2025', revenue: 25680, orders: 123 },
      { period: 'Jun 2025', revenue: 28950, orders: 142 }
    ],
    topProducts: [
      { 
        id: 1, 
        name: 'Elegant Pink Dress', 
        main_image_url: 'https://via.placeholder.com/100',
        totalQuantity: 45, 
        totalRevenue: 4049.55 
      },
      { 
        id: 2, 
        name: 'Summer Blouse', 
        main_image_url: 'https://via.placeholder.com/100',
        totalQuantity: 67, 
        totalRevenue: 3081.33 
      },
      { 
        id: 3, 
        name: 'Designer Handbag', 
        main_image_url: 'https://via.placeholder.com/100',
        totalQuantity: 23, 
        totalRevenue: 2989.77 
      },
      { 
        id: 4, 
        name: 'Casual Jeans', 
        main_image_url: 'https://via.placeholder.com/100',
        totalQuantity: 34, 
        totalRevenue: 2379.66 
      },
      { 
        id: 5, 
        name: 'Cotton T-shirt', 
        main_image_url: 'https://via.placeholder.com/100',
        totalQuantity: 89, 
        totalRevenue: 2313.11 
      }
    ],
    lowStockProducts: [
      { id: 1, name: 'Winter Coat', category: 'robes', stock: 2 },
      { id: 2, name: 'Silk Scarf', category: 'accessoires', stock: 3 },
      { id: 3, name: 'Leather Boots', category: 'chaussures', stock: 1 },
      { id: 4, name: 'Evening Gown', category: 'robes', stock: 4 }
    ]
  };

  // Load statistics from database
  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load from database, fallback to mock data
      try {
        const [dashboardStats, revenueData, topProducts, lowStockProducts] = await Promise.all([
          getDashboardStats(),
          getRevenueChartData(timeRange === 'year' ? 12 : 6),
          getTopProducts(10),
          getLowStockProducts(10)
        ]);

        setStats(dashboardStats);
        setChartData({
          revenueChart: revenueData,
          topProducts,
          lowStockProducts
        });
      } catch (dbError) {
        setStats(mockStats);
        setChartData(mockChartData);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setError('Failed to load statistics. Using demo data.');
      setStats(mockStats);
      setChartData(mockChartData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      icon: isPositive ? FaArrowUp : FaArrowDown,
      color: isPositive ? '#10b981' : '#ef4444'
    };
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: '#f59e0b', icon: FaExclamationTriangle },
      processing: { color: '#3b82f6', icon: FaSync },
      shipped: { color: '#8b5cf6', icon: FaTrendingUp },
      delivered: { color: '#10b981', icon: FaBoxes },
      cancelled: { color: '#ef4444', icon: FaTrendingDown }
    };
    return configs[status] || { color: '#6b7280', icon: FaBoxes };
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <FaExclamationTriangle />
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
        <button onClick={loadStatistics} className={styles.retryButton}>
          <FaSync />
          Try Again
        </button>
      </div>
    );
  }

  const revenueGrowthData = formatGrowth(stats.revenueGrowth);
  const orderGrowthData = formatGrowth(stats.orderGrowth);
  const customerGrowthData = formatGrowth(stats.customerGrowth);

  return (
    <div className={styles.statistics}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Dashboard Analytics</h2>
          <p>Comprehensive overview of your business performance</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.refreshButton} onClick={loadStatistics}>
            <FaSync />
            Refresh Data
          </button>
          <div className={styles.timeRangeSelector}>
            <FaCalendarAlt />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.timeRangeSelect}
            >
              <option value="month">Last 6 Months</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <FaBoxes />
            </div>
            <div className={styles.statTrend}>
              <FaTrendingUp className={styles.trendIcon} />
            </div>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalProducts.toLocaleString()}</h3>
            <p>Total Products</p>
            <div className={styles.statMeta}>
              <span className={styles.category}>Inventory</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <FaShoppingCart />
            </div>
            <div className={styles.statTrend}>
              <orderGrowthData.icon className={styles.trendIcon} style={{ color: orderGrowthData.color }} />
            </div>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>Total Orders</p>
            <div className={styles.growth} style={{ color: orderGrowthData.color }}>
              {orderGrowthData.value}% vs last period
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <FaDollarSign />
            </div>
            <div className={styles.statTrend}>
              <revenueGrowthData.icon className={styles.trendIcon} style={{ color: revenueGrowthData.color }} />
            </div>
          </div>
          <div className={styles.statContent}>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <div className={styles.growth} style={{ color: revenueGrowthData.color }}>
              {revenueGrowthData.value}% vs last period
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <FaUsers />
            </div>
            <div className={styles.statTrend}>
              <customerGrowthData.icon className={styles.trendIcon} style={{ color: customerGrowthData.color }} />
            </div>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalCustomers.toLocaleString()}</h3>
            <p>Total Customers</p>
            <div className={styles.growth} style={{ color: customerGrowthData.color }}>
              {customerGrowthData.value}% vs last period
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${stats.lowStockItems > 0 ? styles.alertCard : ''}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <FaWarehouse />
            </div>
            <div className={styles.statTrend}>
              {stats.lowStockItems > 0 && <FaExclamationTriangle className={styles.alertIcon} />}
            </div>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.lowStockItems}</h3>
            <p>Low Stock Items</p>
            {stats.lowStockItems > 0 && (
              <div className={styles.alertText}>
                Needs immediate attention!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.chartsContainer}>
        {/* Revenue Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h3>
              <FaChartLine />
              Revenue Overview
            </h3>
            <div className={styles.chartActions}>
              <button className={styles.chartButton}>
                <FaEye />
                View Details
              </button>
            </div>
          </div>
          <div className={styles.revenueChart}>
            {chartData.revenueChart.length > 0 ? (
              <div className={styles.chartContainer}>
                <div className={styles.chartGrid}>
                  {chartData.revenueChart.map((data, index) => {
                    const maxRevenue = Math.max(...chartData.revenueChart.map(d => d.revenue));
                    const height = (data.revenue / maxRevenue) * 100;
                    return (
                      <div key={index} className={styles.chartBar}>
                        <div className={styles.barTooltip}>
                          <strong>{formatCurrency(data.revenue)}</strong>
                          <span>{data.orders} orders</span>
                        </div>
                        <div 
                          className={styles.bar}
                          style={{ height: `${height}%` }}
                        >
                          <div className={styles.barGradient}></div>
                        </div>
                        <div className={styles.barLabel}>
                          <div className={styles.period}>{data.period}</div>
                          <div className={styles.amount}>{formatCurrency(data.revenue)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.noData}>
                <FaChartLine />
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className={styles.statusSection}>
          <div className={styles.chartHeader}>
            <h3>
              <FaChartBar />
              Order Status Distribution
            </h3>
          </div>
          <div className={styles.statusGrid}>
            {Object.entries(stats.statusDistribution).map(([status, count]) => {
              const config = getStatusConfig(status);
              const total = Object.values(stats.statusDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
              
              return (
                <div key={status} className={styles.statusCard}>
                  <div className={styles.statusIcon} style={{ backgroundColor: config.color }}>
                    <config.icon />
                  </div>
                  <div className={styles.statusContent}>
                    <div className={styles.statusCount}>{count}</div>
                    <div className={styles.statusLabel}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <div className={styles.statusPercentage}>{percentage}%</div>
                  </div>
                  <div className={styles.statusProgress}>
                    <div 
                      className={styles.progressBar} 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        {/* Top Products */}
        <div className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <h3>
              <FaStar />
              Top Selling Products
            </h3>
            <button className={styles.sectionButton}>
              View All Products
            </button>
          </div>
          <div className={styles.topProducts}>
            {chartData.topProducts.length > 0 ? (
              chartData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productRank}>
                    <span className={styles.rankNumber}>#{index + 1}</span>
                  </div>
                  <div className={styles.productImage}>
                    {product.main_image_url ? (
                      <img src={product.main_image_url} alt={product.name} />
                    ) : (
                      <div className={styles.noImage}>
                        <FaBoxes />
                      </div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h4>{product.name}</h4>
                    <div className={styles.productStats}>
                      <span className={styles.quantity}>{product.totalQuantity} sold</span>
                      <span className={styles.revenue}>{formatCurrency(product.totalRevenue)}</span>
                    </div>
                  </div>
                  <div className={styles.productTrend}>
                    <FaTrendingUp />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>
                <FaBoxes />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {chartData.lowStockProducts.length > 0 && (
          <div className={styles.alertSection}>
            <div className={styles.sectionHeader}>
              <h3>
                <FaExclamationTriangle />
                Low Stock Alert
              </h3>
              <span className={styles.alertBadge}>{chartData.lowStockProducts.length}</span>
            </div>
            <div className={styles.lowStockList}>
              {chartData.lowStockProducts.map((product) => (
                <div key={product.id} className={styles.lowStockItem}>
                  <div className={styles.productInfo}>
                    <h4>{product.name}</h4>
                    <p>Category: {product.category}</p>
                  </div>
                  <div className={styles.stockInfo}>
                    <span className={styles.stockCount}>{product.stock || 0}</span>
                    <span className={styles.stockLabel}>left in stock</span>
                  </div>
                  <div className={styles.urgencyIndicator}>
                    {(product.stock || 0) <= 2 ? (
                      <div className={styles.criticalUrgency}>Critical</div>
                    ) : (
                      <div className={styles.lowUrgency}>Low</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
