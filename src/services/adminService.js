import { supabaseAdmin } from '../supabaseAdminClient';

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    console.log('=== GETTING DASHBOARD STATS ===');
    
    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue from delivered orders
    const { data: revenueData } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

    // Get low stock products count
    const { count: lowStockItems } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10);

    // Get total customers (unique emails from orders)
    const { data: customerData } = await supabaseAdmin
      .from('orders')
      .select('customer_email');

    const uniqueCustomers = new Set(customerData?.map(order => order.customer_email) || []);
    const totalCustomers = uniqueCustomers.size;

    // Calculate revenue growth (compare current month to previous month)
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const { data: currentMonthRevenue } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered')
      .gte('order_date', currentMonthStart.toISOString());

    const { data: previousMonthRevenue } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered')
      .gte('order_date', previousMonth.toISOString())
      .lt('order_date', currentMonthStart.toISOString());

    const currentTotal = currentMonthRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
    const previousTotal = previousMonthRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

    const revenueGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Calculate order growth (current month vs previous month)
    const { count: currentMonthOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('order_date', currentMonthStart.toISOString());

    const { count: previousMonthOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('order_date', previousMonth.toISOString())
      .lt('order_date', currentMonthStart.toISOString());    const orderGrowth = previousMonthOrders > 0 ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 : 0;

    // Get order status distribution
    const { data: statusData } = await supabaseAdmin
      .from('orders')
      .select('status');

    const statusDistribution = statusData?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      lowStockItems: lowStockItems || 0,
      totalCustomers,
      revenueGrowth,
      orderGrowth,
      statusDistribution
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return zeros instead of throwing - let UI handle empty state
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      lowStockItems: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      orderGrowth: 0,
      statusDistribution: {}
    };
  }
};

// Revenue Chart Data
export const getRevenueChartData = async (months = 6) => {
  try {
    const chartData = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      // Sum delivered order totals for the month
      const { data: monthlyRevenueData } = await supabaseAdmin
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('order_date', monthDate.toISOString())
        .lt('order_date', nextMonth.toISOString());

      // Count all orders placed during the month (regardless of status)
      const { count: monthlyOrders } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('order_date', monthDate.toISOString())
        .lt('order_date', nextMonth.toISOString());

      const revenue = monthlyRevenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

      chartData.push({
        period: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        orders: monthlyOrders || 0
      });
    }

  return chartData;
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    return [];
  }
};

// Top Products
export const getTopProducts = async (limit = 10) => {
  try {
    // This requires order_items table to track product sales
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price_each,
        products (
          name,
          main_image_url
        )
      `);

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    // Group by product and calculate totals
    const productStats = orderItems.reduce((acc, item) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: item.products?.name || 'Unknown Product',
          main_image_url: item.products?.main_image_url,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      acc[productId].totalQuantity += item.quantity || 0;
  acc[productId].totalRevenue += (item.quantity || 0) * (item.price_each || 0);
      return acc;
    }, {});

    // Convert to array and sort by revenue
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return topProducts;
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
};

// Low Stock Products
export const getLowStockProducts = async (limit = 10) => {
  try {
    const { data: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, category, stock')
      .lt('stock', 10)
      .order('stock', { ascending: true })
      .limit(limit);

    return lowStockProducts || [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// Product Management
export const getProducts = async (page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc') => {
  try {
    console.log('=== GET PRODUCTS START ===');
    console.log('Parameters:', { page, limit, search, sortBy, sortOrder });
    console.log('Supabase admin client available:', !!supabaseAdmin);
    
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' });

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,name_ar.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('Executing query...');
    const { data: products, count, error } = await query;
    
    console.log('Query response:', { products: products?.length, count, error });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('=== GET PRODUCTS SUCCESS ===');
    return {
      products: products || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('=== GET PRODUCTS FAILED ===');
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    console.log('=== ADMIN SERVICE DELETE START ===');
    console.log('Received ID to delete:', id, 'type:', typeof id);

    // Ensure id is the correct type (UUID string expected by DB)
    const idStr = typeof id === 'string' ? id : String(id);

    // 1) Attempt to remove dependent order_items first (simulates ON DELETE CASCADE)
    // If the table doesn't exist, ignore that specific error and continue
    try {
      console.log('Attempting to delete dependent order_items...');
      const { error: oiError } = await supabaseAdmin
        .from('order_items')
        .delete()
        .eq('product_id', idStr);
      if (oiError) {
        // 42P01 => undefined_table; ignore and continue
        if (oiError.code !== '42P01') {
          console.warn('Could not delete dependent order_items:', oiError);
        }
      } else {
        console.log('Dependent order_items deleted (if any).');
      }
    } catch (childErr) {
      console.warn('Error while deleting dependent rows, continuing:', childErr);
    }

    // 2) Now delete the product
    const { data, error, count } = await supabaseAdmin
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', idStr)
      .select('id', { count: 'exact' });

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    // When RLS blocks or id doesn't exist, no rows are affected
    const affected = Array.isArray(data) ? data.length : (typeof count === 'number' ? count : 0);
    if (!affected) {
      const err = new Error('No product deleted (id not found, blocked by RLS, or FK constraint)');
      err.code = 'NO_ROWS_DELETED';
      throw err;
    }

    console.log('=== ADMIN SERVICE DELETE SUCCESS ===', { affected });
    return true;
  } catch (error) {
    console.error('=== ADMIN SERVICE DELETE FAILED ===', error);
    throw error;
  }
};// Order Management
export const getOrders = async (page = 1, limit = 10, search = '', statusFilter = 'all', sortBy = 'order_date', sortOrder = 'desc') => {
  try {
    let query = supabaseAdmin
      .from('orders')
      .select(`
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        order_date,
        status,
        total_amount,
        order_items (
          order_item_id,
          product_id,
          quantity,
          price_each,
          products (
            name,
            main_image_url
          )
        )
      `, { count: 'exact' });

    // Add search filter
    if (search) {
      query = query.or(`order_id.eq.${search},customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    // Add status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: orders, count, error } = await query;

    if (error) throw error;

    // Transform the data to match the expected format
    const transformedOrders = orders?.map(order => ({
      id: order.order_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      created_at: order.order_date,
      status: order.status,
      total_price: parseFloat(order.total_amount),
      order_items: order.order_items?.map(item => ({
        id: item.order_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price_each),
        products: item.products
      })) || []
    })) || [];

    return {
      orders: transformedOrders,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Image Upload
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Export utility functions
export const exportOrdersToCSV = async (filters = {}) => {
  try {
    const { orders } = await getOrders(1, 1000, filters.search, filters.status, 'created_at', 'desc');
    
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer_name,
      'Customer Email': order.customer_email,
      'Total Price': order.total_price,
      'Status': order.status,
      'Payment Method': order.payment_method,
      'Created At': new Date(order.created_at).toLocaleDateString(),
      'Items': order.order_items?.map(item => `${item.products?.name} (${item.quantity})`).join('; ') || ''
    }));

    return csvData;
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};