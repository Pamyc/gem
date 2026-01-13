import pg from 'pg';
const { Pool } = pg;

// Используем Connection String с новым паролем
const dbConfig = {
  connectionString: 'postgresql://gen_user:@gemdb@gemdb@192.168.0.4:5432/default_db',
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(dbConfig);
export default pool;