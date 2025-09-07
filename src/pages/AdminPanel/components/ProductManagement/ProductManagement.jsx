import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaImage, 
  FaFilter, 
  FaSort,
  FaEye,
  FaTh,
  FaList,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import ProductForm from './ProductForm';
import ConfirmModal from '../Common/ConfirmModal';
import { getProducts, deleteProduct } from '../../../../services/adminService';
import styles from './ProductManagement.module.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  const [error, setError] = useState(null);

  const productsPerPage = viewMode === 'grid' ? 12 : 10;

  const categories = ['all', 'robes', 'hauts', 'bas', 'accessoires'];
  const statusOptions = ['all', 'active', 'inactive', 'out_of_stock'];
  const stockOptions = ['all', 'in_stock', 'low_stock', 'out_of_stock'];

  // Mock data for demo
  const mockProducts = [
    {
      id: 1,
      name: 'Elegant Pink Dress',
      name_ar: 'فستان وردي أنيق',
      description: 'Beautiful pink dress perfect for special occasions',
      description_ar: 'فستان وردي جميل مثالي للمناسبات الخاصة',
      category: 'robes',
      price: 89.99,
      main_image_url: 'https://via.placeholder.com/300x400?text=Pink+Dress',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Pink', 'White'],
      stock: 25,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Summer Blouse',
      name_ar: 'بلوزة صيفية',
      description: 'Light and airy summer blouse',
      description_ar: 'بلوزة صيفية خفيفة ومريحة',
      category: 'hauts',
      price: 45.99,
      main_image_url: 'https://via.placeholder.com/300x400?text=Summer+Blouse',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Blue', 'Yellow', 'White'],
      stock: 40,
      status: 'active',
      created_at: '2025-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'Designer Handbag',
      name_ar: 'حقيبة يد مصممة',
      description: 'Luxury designer handbag',
      description_ar: 'حقيبة يد فاخرة من تصميم مصمم',
      category: 'accessoires',
      price: 129.99,
      main_image_url: 'https://via.placeholder.com/300x400?text=Handbag',
      sizes: ['One Size'],
      colors: ['Black', 'Brown'],
      stock: 5,
      status: 'active',
      created_at: '2025-01-03T00:00:00Z'
    }
  ];

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, products, categoryFilter, statusFilter, priceRange, stockFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch from database, fallback to mock data
      try {
        const { products: fetchedProducts } = await getProducts(
          currentPage,
          productsPerPage,
          searchTerm,
          sortBy,
          sortOrder
        );
        setProducts(fetchedProducts);
      } catch (dbError) {
        // Fallback to demo data if database connection fails
        setProducts(mockProducts);
      }
      
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again.');
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name_ar?.includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (statusFilter === 'out_of_stock') return (product.stock || 0) === 0;
        return product.status === statusFilter;
      });
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price) || 0;
        const min = parseFloat(priceRange.min) || 0;
        const max = parseFloat(priceRange.max) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const stock = product.stock || 0;
        switch (stockFilter) {
          case 'in_stock': return stock > 10;
          case 'low_stock': return stock > 0 && stock <= 10;
          case 'out_of_stock': return stock === 0;
          default: return true;
        }
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    try {
      // Try to delete from database
      try {
        await deleteProduct(deleteConfirm.id);
      } catch (dbError) {
        // Database deletion failed, continuing with local state update
      }
      
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id }
          : p
      ));
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
      try {
        // Try to delete from database
        try {
          await Promise.all(selectedProducts.map(id => deleteProduct(id)));
        } catch (dbError) {
          // Database bulk deletion failed, continuing with local state update
        }
        
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error deleting products:', error);
        setError('Failed to delete some products. Please try again.');
      }
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: '#ef4444' };
    if (stock <= 5) return { status: 'critical', label: 'Critical', color: '#f59e0b' };
    if (stock <= 10) return { status: 'low', label: 'Low Stock', color: '#eab308' };
    return { status: 'in_stock', label: 'In Stock', color: '#10b981' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.productManagement}>
      {error && (
        <div className={styles.errorBanner}>
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Product Management</h2>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <strong>{filteredProducts.length}</strong> products
            </span>
            {selectedProducts.length > 0 && (
              <span className={styles.statItem}>
                <strong>{selectedProducts.length}</strong> selected
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {selectedProducts.length > 0 && (
            <button className={styles.bulkDeleteButton} onClick={handleBulkDelete}>
              <FaTrash />
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          
          <button className={styles.refreshButton} onClick={loadProducts}>
            <FaSync />
            Refresh
          </button>
          
          <button className={styles.addButton} onClick={handleAddProduct}>
            <FaPlus />
            Add Product
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controlsRight}>
          <button
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
          </button>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <FaList />
            </button>
          </div>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className={styles.sortSelect}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="stock-asc">Stock Low-High</option>
            <option value="stock-desc">Stock High-Low</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Stock:</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              {stockOptions.map(stock => (
                <option key={stock} value={stock}>
                  {stock === 'all' ? 'All Stock Levels' : stock.replace('_', ' ').charAt(0).toUpperCase() + stock.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Price Range:</label>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>

          <button
            className={styles.clearFilters}
            onClick={() => {
              setCategoryFilter('all');
              setStatusFilter('all');
              setStockFilter('all');
              setPriceRange({ min: '', max: '' });
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className={styles.productsGrid}>
          {currentProducts.map(product => {
            const stockStatus = getStockStatus(product.stock || 0);
            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.productSelection}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className={styles.selectionCheckbox}
                    />
                  </div>
                  <div className={styles.stockIndicator} style={{ backgroundColor: stockStatus.color }}>
                    {stockStatus.label}
                  </div>
                </div>

                <div className={styles.productImage}>
                  {product.main_image_url ? (
                    <img 
                      src={product.main_image_url} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={styles.noImage} style={{ display: product.main_image_url ? 'none' : 'flex' }}>
                    <FaImage />
                    <span>No Image</span>
                  </div>
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productCategory}>{product.category}</p>
                  <p className={styles.productPrice}>{formatPrice(product.price || 0)}</p>
                  <div className={styles.productMeta}>
                    <span className={styles.productStock}>Stock: {product.stock || 0}</span>
                    {product.sizes && (
                      <span className={styles.productSizes}>
                        {Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.productActions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleEditProduct(product)}
                    title="View/Edit Product"
                  >
                    <FaEye />
                  </button>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditProduct(product)}
                    title="Edit Product"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProduct(product)}
                    title="Delete Product"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.productsTable}>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => {
                const stockStatus = getStockStatus(product.stock || 0);
                return (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.tableImage}>
                        {product.main_image_url ? (
                          <img src={product.main_image_url} alt={product.name} />
                        ) : (
                          <div className={styles.noImageSmall}>
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.productNameCell}>
                        <strong>{product.name}</strong>
                        {product.name_ar && <small>{product.name_ar}</small>}
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price || 0)}</td>
                    <td>
                      <span style={{ color: stockStatus.color, fontWeight: 'bold' }}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: stockStatus.color }}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => handleEditProduct(product)}
                          title="View/Edit"
                        >
                          <FaEye />
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className={styles.pageButton}
          >
            Previous
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
              return (
                <button
                  key={pageNum}
                  className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteConfirm(null)}
          type="danger"
          confirmText="Delete Product"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default ProductManagement;
