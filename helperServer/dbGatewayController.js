import pg from 'pg';
import { pool } from './db.js';

const { Client } = pg;

/**
 * Универсальный обработчик (Gateway) к базе данных.
 * Работает как AmoCRM API:
 * - Поддерживает GET (параметры в URL)
 * - Поддерживает POST (параметры в JSON body)
 */
export async function handleDbRequest(req, res) {
  // 1. Определение источника данных (GET или POST)
  const source = req.method === 'GET' ? req.query : req.body;

  // 2. Извлечение SQL
  const sql = source.sql;
  
  if (!sql) {
      return res.status(400).json({ 
          ok: false, 
          error: "Parameter 'sql' is required",
          hint: "Pass sql in query params (?sql=SELECT...) or body JSON"
      });
  }

  // 3. Формирование конфига подключения
  // Если передан объект 'config' (обычно в POST), используем его.
  // Иначе пытаемся собрать конфиг из плоских параметров (актуально для GET ?host=...&user=...)
  let dbConfig = source.config;

  if (!dbConfig && (source.host || source.user)) {
      dbConfig = {
          host: source.host,
          port: source.port,
          database: source.database,
          user: source.user,
          password: source.password,
          ssl: source.ssl === 'true' || source.ssl === true
      };
  }

  let client;
  let isCustomClient = false;

  try {
    // 4. Стратегия подключения
    if (dbConfig && dbConfig.host) {
        // A. Внешнее подключение (через параметры шлюза)
        client = new Client({
            host: dbConfig.host,
            port: parseInt(dbConfig.port || 5432),
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            connectionTimeoutMillis: 5000,
            ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false
        });
        await client.connect();
        isCustomClient = true;
    } else {
        // B. Внутреннее подключение (серверный пул)
        // Используется если параметры подключения не переданы
        client = await pool.connect();
    }

    const startTime = Date.now();
    
    // 5. Выполнение запроса
    const resDb = await client.query(sql);
    const duration = Date.now() - startTime;
    
    // 6. Формирование ответа в стиле API
    const response = {
        ok: true,
        _meta: {
            timestamp: Date.now(),
            duration_ms: duration,
            row_count: resDb.rowCount,
            command: resDb.command
        },
        // Если это SELECT, возвращаем массив строк в поле data (аналог _embedded)
        data: resDb.rows || [],
        // Для отладки возвращаем, какой SQL был выполнен
        debug: {
            executed_sql: sql,
            connection_mode: isCustomClient ? 'gateway_custom' : 'direct_pool'
        }
    };

    res.json(response);

  } catch (err) {
    console.error("[DB Gateway] Error:", err.message);
    res.status(500).json({ 
      ok: false, 
      error: "Database execution failed", 
      message: err.message,
      details: err.detail || null
    });
  } finally {
    // 7. Очистка ресурсов
    if (client) {
        if (isCustomClient) {
            await client.end().catch(e => console.warn("Error closing custom client", e)); 
        } else {
            client.release(); 
        }
    }
  }
}