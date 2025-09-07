// Test database connection with the new schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogjunbybimpaqvybqmqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nanVuYnliaW1wYXF2eWJxbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTg5MTgsImV4cCI6MjA3Mjc3NDkxOH0.ysuqzvs1ILEwdyovDBeoBqUzgVgWdSDTMKcwNRthwIk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection...');

  try {
    // Test orders table
    console.log('\n1. Testing Orders table:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('order_id, customer_name, total_amount, status, order_date')
      .limit(5);

    if (ordersError) {
      console.error('Orders error:', ordersError);
    } else {
      console.log('Orders found:', orders?.length || 0);
      console.log('Sample order:', orders?.[0]);
    }

    // Test order_items table
    console.log('\n2. Testing Order_Items table:');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('order_item_id, order_id, product_id, quantity, price_each')
      .limit(5);

    if (itemsError) {
      console.error('Order Items error:', itemsError);
    } else {
      console.log('Order items found:', orderItems?.length || 0);
      console.log('Sample order item:', orderItems?.[0]);
    }

    // Test products table
    console.log('\n3. Testing Products table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, main_image_url')
      .limit(5);

    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log('Products found:', products?.length || 0);
      console.log('Sample product:', products?.[0]);
    }

    // Test join query (orders with items and products)
    console.log('\n4. Testing join query:');
    const { data: joinedData, error: joinError } = await supabase
      .from('orders')
      .select(`
        order_id,
        customer_name,
        total_amount,
        status,
        order_date,
        order_items (
          order_item_id,
          quantity,
          price_each,
          products (
            name,
            main_image_url
          )
        )
      `)
      .limit(3);

    if (joinError) {
      console.error('Join query error:', joinError);
    } else {
      console.log('Joined data found:', joinedData?.length || 0);
      console.log('Sample joined order:', JSON.stringify(joinedData?.[0], null, 2));
    }

  } catch (error) {
    console.error('Connection error:', error);
  }
}

testDatabase();
