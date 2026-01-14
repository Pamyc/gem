import pg from 'pg';
import { pool } from './db.js';

const { Client } = pg;

/**
 * Обработчик запроса к шлюзу БД.
 * Поддерживает выполнение через общий пул (если конфиг не передан)
 * или через отдельное соединение (если передан config).
 */
export async function handleDbRequest(req, res) {
  const { sql, config } = req.body;
  
  if (!sql) {
      return res.status(400).json({ status: "error", message: "SQL query is required" });
  }

  let client;
  let isCustomClient = false;

  try {
    // 1. Определение стратегии подключения
    if (config && config.host) {
        // Стратегия А: Отдельное соединение (Custom Gateway)
        client = new Client({
            host: config.host,
            port: parseInt(config.port),
            user: config.user,
            password: config.password,
            database: config.database,
            connectionTimeoutMillis: 5000, // Тайм-аут 5 сек
            ssl: config.ssl ? { rejectUnauthorized: false } : false // Опционально SSL
        });
        await client.connect();
        isCustomClient = true;
    } else {
        // Стратегия Б: Использование системного пула (Direct Server Access)
        client = await pool.connect();
    }

    const startTime = Date.now();
    
    // 2. Выполнение запроса
    const resDb = await client.query(sql);
    
    const duration = Date.now() - startTime;
    
    // 3. Формирование результата
    // Если это SELECT - возвращаем строки, иначе описание результата операции
    const resultData = resDb.rows.length > 0 
        ? resDb.rows 
        : (resDb.command + ' completed. Rows affected: ' + resDb.rowCount);

    res.json({ 
      status: "success", 
      executedSql: sql,
      duration: `${duration}ms`,
      result: resultData,
      message: "Запрос выполнен успешно через шлюз"
    });

  } catch (err) {
    console.error("[DB Gateway] Error:", err.message);
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка выполнения SQL или подключения", 
      details: err.message 
    });
  } finally {
    // 4. Очистка ресурсов
    if (client) {
        if (isCustomClient) {
            // Закрываем физическое соединение
            await client.end().catch(e => console.warn("Error closing custom client", e)); 
        } else {
            // Возвращаем в пул
            client.release(); 
        }
    }
  }
}