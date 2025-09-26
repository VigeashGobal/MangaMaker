const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Viggy%40west11@db.dtnozgaaxvptxqbqffur.supabase.co:5432/postgres?sslmode=require'
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
