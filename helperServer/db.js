import pg from 'pg';
const { Pool } = pg;

// Используем Connection String с актуальным паролем
const dbConfig = {
  connectionString: 'postgresql://gen_user:searchtrg@192.168.0.4:5432/default_db',
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(dbConfig);
export default pool;