import React, { useState } from 'react';
import { 
  FaSignOutAlt, 
  FaBox, 
  FaShoppingCart, 
  FaChartBar, 
  FaBars, 
  FaTimes, 
  FaHome,
  FaBell,
  FaUser,
  FaSearch
} from 'react-icons/fa';
import ProductManagement from '../ProductManagement/ProductManagement';
import OrderManagement from '../OrderManagement/OrderManagement';
import Statistics from '../Statistics/Statistics';
import styles from './Dashboard.module.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('statistics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'statistics', label: 'Dashboard', icon: FaHome, description: 'Overview & Analytics' },
    { id: 'products', label: 'Products', icon: FaBox, description: 'Manage Inventory' },
    { id: 'orders', label: 'Orders', icon: FaShoppingCart, description: 'Order Management' },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar, description: 'Detailed Reports' }
  ];

  const getBreadcrumbs = () => {
    const current = menuItems.find(item => item.id === activeSection);
    return [
      { label: 'Admin Panel', path: '' },
      { label: current?.label || 'Dashboard', path: activeSection }
    ];
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'statistics':
      case 'analytics':
        return <Statistics onNavigate={(section) => { setActiveSection(section); setIsSidebarOpen(false); }} />;
      default:
        return <Statistics />;
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      {/* Mobile Menu Overlay */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.active : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>🌸</div>
            <h2 className={styles.logo}>Blossom Admin</h2>
          </div>
          <button 
            className={styles.closeSidebar}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Sidebar Search */}
        <div className={styles.sidebarSearch}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <nav className={styles.navigation}>
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                title={item.description}
              >
                <Icon className={styles.navIcon} />
                <div className={styles.navContent}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <FaUser />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuToggle}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>
            
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className={styles.breadcrumb}>
                  {index > 0 && <span className={styles.separator}>/</span>}
                  <span className={index === getBreadcrumbs().length - 1 ? styles.currentCrumb : styles.crumb}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.notificationButton}
              title="Notifications"
              onClick={() => {
                setActiveSection('orders');
                setIsSidebarOpen(false);
              }}
            >
              <FaBell />
              <span className={styles.notificationBadge}>3</span>
            </button>
            
            {/* settings button removed */}

            <div className={styles.headerUser}>
              <div className={styles.userAvatar}>
                <FaUser />
              </div>
              <span className={styles.welcomeText}>
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>

            <button className={styles.headerLogout} onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
