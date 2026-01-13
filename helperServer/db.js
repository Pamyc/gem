import pg from 'pg';
const { Pool } = pg;

// Конфигурация подключения к БД (Private Network)
const pool = new Pool({
  user: 'gen_user',
  host: '192.168.0.4',
  database: 'default_db',
  password: '@gemdb@gemdb',
  port: 5432,
  // Таймаут подключения, чтобы сервер не вис при отсутствии связи
  connectionTimeoutMillis: 2000, 
});

export default pool;