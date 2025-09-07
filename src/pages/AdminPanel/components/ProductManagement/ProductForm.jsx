import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import styles from './ProductForm.module.css';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    category: '',
    price: '',
    images: [],
    sizes: [],
    colors: [],
    stock: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const categories = [
    { value: 'robes', label: 'Dresses' },
    { value: 'hauts', label: 'Tops' },
    { value: 'bas', label: 'Bottoms' },
    { value: 'accessoires', label: 'Accessories' }
  ];

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const commonColors = ['Black', 'White', 'Pink', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Gray', 'Brown'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock?.toString() || '',
        status: product.status || 'active'
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (formData.sizes.length === 0) {
      newErrors.sizes = 'At least one size is required';
    }

    if (formData.colors.length === 0) {
      newErrors.colors = 'At least one color is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    onSave(productData);
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className={styles.closeButton} onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Product Name (English) *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? styles.error : ''}
                placeholder="Enter product name"
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="name_ar">Product Name (Arabic)</label>
              <input
                type="text"
                id="name_ar"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                placeholder="اسم المنتج بالعربية"
                dir="rtl"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? styles.error : ''}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className={styles.errorText}>{errors.category}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? styles.error : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={errors.stock ? styles.error : ''}
                placeholder="0"
                min="0"
              />
              {errors.stock && <span className={styles.errorText}>{errors.stock}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description (English)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter product description"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description_ar">Description (Arabic)</label>
            <textarea
              id="description_ar"
              name="description_ar"
              value={formData.description_ar}
              onChange={handleChange}
              rows="3"
              placeholder="وصف المنتج بالعربية"
              dir="rtl"
            />
          </div>

          {/* Images Section */}
          <div className={styles.inputGroup}>
            <label>Product Images *</label>
            <div className={styles.imageManager}>
              <div className={styles.addImageContainer}>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className={styles.imageInput}
                />
                <button type="button" onClick={addImage} className={styles.addImageButton}>
                  <FaPlus />
                </button>
              </div>
              
              {formData.images.length > 0 && (
                <div className={styles.imageList}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image} alt={`Product ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className={styles.removeImageButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.images && <span className={styles.errorText}>{errors.images}</span>}
          </div>

          {/* Sizes Section */}
          <div className={styles.inputGroup}>
            <label>Available Sizes *</label>
            <div className={styles.tagManager}>
              <div className={styles.addTagContainer}>
                <select
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className={styles.tagSelect}
                >
                  <option value="">Select Size</option>
                  {commonSizes.filter(size => !formData.sizes.includes(size)).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <button type="button" onClick={addSize} className={styles.addTagButton}>
                  <FaPlus />
                </button>
              </div>
              
              <div className={styles.tagList}>
                {formData.sizes.map(size => (
                  <span key={size} className={styles.tag}>
                    {size}
                    <button type="button" onClick={() => removeSize(size)}>
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {errors.sizes && <span className={styles.errorText}>{errors.sizes}</span>}
          </div>

          {/* Colors Section */}
          <div className={styles.inputGroup}>
            <label>Available Colors *</label>
            <div className={styles.tagManager}>
              <div className={styles.addTagContainer}>
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className={styles.tagSelect}
                >
                  <option value="">Select Color</option>
                  {commonColors.filter(color => !formData.colors.includes(color)).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <button type="button" onClick={addColor} className={styles.addTagButton}>
                  <FaPlus />
                </button>
              </div>
              
              <div className={styles.tagList}>
                {formData.colors.map(color => (
                  <span key={color} className={styles.tag}>
                    {color}
                    <button type="button" onClick={() => removeColor(color)}>
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {errors.colors && <span className={styles.errorText}>{errors.colors}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
