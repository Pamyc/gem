export const DB_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS test_connection (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `INSERT INTO test_connection (text) 
   SELECT 'Connection successful'
   WHERE NOT EXISTS (SELECT 1 FROM test_connection);`
];