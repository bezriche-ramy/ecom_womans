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
import { getProducts, deleteProduct, createProduct, updateProduct } from '../../../../services/adminService';
import { supabaseAdmin } from '../../../../supabaseAdminClient';
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
      
      console.log('Loading products from database...');
      
      // Always try to fetch from database first
      const { products: fetchedProducts } = await getProducts(
        currentPage,
        productsPerPage,
        searchTerm,
        sortBy,
        sortOrder
      );
      
      console.log('Products loaded from database:', fetchedProducts);
      console.log('Number of products:', fetchedProducts.length);
      if (fetchedProducts.length > 0) {
        console.log('First product:', fetchedProducts[0]);
        console.log('First product ID:', fetchedProducts[0].id, 'type:', typeof fetchedProducts[0].id);
      }
      setProducts(fetchedProducts);
      
    } catch (error) {
      console.error('Error loading products from database:', error);
      setError(`Failed to load products from database: ${error.message}.`);
      // IMPORTANT: Do not fallback to mock data; keep products empty so UI reflects real DB failure
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };  const applyFilters = () => {
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

  // Test database connection and inspect table
  const testDatabaseConnection = async () => {
    try {
      console.log('=== TESTING DATABASE CONNECTION & TABLE STRUCTURE ===');
      
      // Test basic connection
      const { data, error, count } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .limit(10);
      
      if (error) {
        console.error('Database connection failed:', error);
        setError(`Database connection failed: ${error.message}`);
        return;
      }
      
      console.log('✅ Database connection successful!');
      console.log('Total products in database:', count);
      console.log('First 10 products:', data);
      
      if (data && data.length > 0) {
        console.log('Sample product structure:', data[0]);
        console.log('Available columns:', Object.keys(data[0]));
        console.log('ID field value and type:', data[0].id, typeof data[0].id);
      } else {
        console.log('⚠️ Products table is empty!');
        setError('⚠️ Products table is empty - add some products first');
        return;
      }
      
      // Test if we can insert a test product
      console.log('Testing insert capability...');
      const testProduct = {
        name: 'Test Product ' + Date.now(),
        price: 99.99,
        stock: 1,
        category: 'test'
      };
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('products')
        .insert([testProduct])
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert test failed:', insertError);
        setError(`Insert failed: ${insertError.message}`);
      } else {
        console.log('✅ Insert test successful:', insertData);
        
        // Test delete on the test product
        console.log('Testing delete capability...');
        const { error: deleteError } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', insertData.id);
        
        if (deleteError) {
          console.error('Delete test failed:', deleteError);
          setError(`Delete failed: ${deleteError.message}`);
        } else {
          console.log('✅ Delete test successful!');
          setError('✅ All database operations working correctly!');
        }
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setError(`Connection test failed: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      console.log('=== DELETE OPERATION START ===');
      console.log('Product to delete:', deleteConfirm);
      console.log('Product ID:', deleteConfirm.id);
      console.log('Product ID type:', typeof deleteConfirm.id);
      
      // Check if deleteProduct function exists
      console.log('deleteProduct function:', typeof deleteProduct);
      
      // Try to delete from database
      console.log('Calling deleteProduct...');
      const result = await deleteProduct(deleteConfirm.id);
      console.log('deleteProduct returned:', result);
      
      // Reload products to reflect the deletion
      console.log('Reloading products...');
      await loadProducts();
      console.log('Products reloaded');
      
      setDeleteConfirm(null);
      console.log('=== DELETE OPERATION COMPLETED ===');
      
    } catch (error) {
      console.error('=== DELETE OPERATION FAILED ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      setError(`Failed to delete product: ${error.message}. Please check the browser console for details.`);
      setDeleteConfirm(null);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      // Map form data to database schema
      const dbPayload = {
        name: productData.name,
        name_fr: productData.name_fr || '',
        name_ar: productData.name_ar || '',
        description: productData.description || '',
        description_fr: productData.description_fr || '',
        description_ar: productData.description_ar || '',
        category: productData.category,
        category_fr: productData.category_fr || '',
        category_ar: productData.category_ar || '',
        price: parseFloat(productData.price),
        main_image_url: productData.images && productData.images.length > 0 ? productData.images[0] : '',
        image_urls: productData.images || [],
        size: Array.isArray(productData.sizes) ? productData.sizes.join(', ') : (productData.sizes || ''),
        color: Array.isArray(productData.colors) ? productData.colors.join(', ') : (productData.colors || ''),
        stock: parseInt(productData.stock)
      };

      console.log('Attempting to save product:', dbPayload);

      if (editingProduct) {
        // Update existing product
        try {
          console.log('Updating product with ID:', editingProduct.id);
          const updatedProduct = await updateProduct(editingProduct.id, dbPayload);
          console.log('Product updated successfully:', updatedProduct);
          
          // Update local state with DB response
          setProducts(prev => prev.map(p => 
            p.id === editingProduct.id ? {
              ...updatedProduct,
              sizes: updatedProduct.size ? updatedProduct.size.split(', ') : [],
              colors: updatedProduct.color ? updatedProduct.color.split(', ') : [],
              images: updatedProduct.image_urls || []
            } : p
          ));
          
          // Reload products to ensure consistency
          await loadProducts();
          
        } catch (dbError) {
          console.error('Database update failed:', dbError);
          setError(`Failed to update product in database: ${dbError.message}`);
          // Don't fallback to local update if DB fails - show error instead
          return;
        }
      } else {
        // Add new product
        try {
          console.log('Creating new product');
          const createdProduct = await createProduct(dbPayload);
          console.log('Product created successfully:', createdProduct);
          
          // Reload products to show the new one
          await loadProducts();
          
        } catch (dbError) {
          console.error('Database creation failed:', dbError);
          setError(`Failed to create product in database: ${dbError.message}`);
          // Don't fallback to local addition if DB fails - show error instead
          return;
        }
      }
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
      try {
        console.log('Attempting to delete products with IDs:', selectedProducts);
        
        // Try to delete from database
        await Promise.all(selectedProducts.map(id => deleteProduct(id)));
        console.log('Products deleted successfully from database');
        
        // Reload products to reflect the deletions
        await loadProducts();
        
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error deleting products:', error);
        setError(`Failed to delete some products: ${error.message}`);
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
          
          <button className={styles.testButton} onClick={testDatabaseConnection} style={{backgroundColor: '#28a745', color: 'white', marginRight: '10px'}}>
            🔍 Test Database
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
