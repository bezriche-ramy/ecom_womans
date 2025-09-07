import { supabase } from './src/supabaseClient.js';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('Response data:', data);
    
    // Test if we can actually read products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Error reading products:', productsError);
      return false;
    }
    
    console.log('✅ Products table accessible!');
    console.log('Sample products:', products);
    
    return true;
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

testDatabaseConnection();
