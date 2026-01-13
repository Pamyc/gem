import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from 'pg'; // Импортируем pg для создания динамических клиентов
import { pool } from './helperServer/db.js';
import { setupHandlers } from './helperServer/apiHandlers.js';
import { runWorkerCycle } from './helperServer/worker.js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "dist")));

// Инициализация БД при запуске
async function initializeDatabase() {
    console.log('[Server] Database initialization skipped (Connection Test Mode)');
    return Promise.resolve();
}

// Подключаем API обработчики
setupHandlers(app, pool);

// API Роут для выполнения произвольного SQL с возможностью кастомного подключения
app.post("/api/db-test", async (req, res) => {
  const { sql, config } = req.body;
  
  if (!sql) {
      return res.status(400).json({ status: "error", message: "SQL query is required" });
  }

  let client;
  let isCustomClient = false;

  try {
    // Если передан конфиг с клиента, создаем новое соединение
    if (config && config.host) {
        client = new Client({
            host: config.host,
            port: parseInt(config.port),
            user: config.user,
            password: config.password,
            database: config.database,
            connectionTimeoutMillis: 5000, // Тайм-аут 5 сек
        });
        await client.connect();
        isCustomClient = true;
    } else {
        // Иначе используем общий пул
        client = await pool.connect();
    }

    const startTime = Date.now();
    
    // Выполняем произвольный запрос
    const resDb = await client.query(sql);
    
    const duration = Date.now() - startTime;
    
    // Определяем тип результата
    const resultData = resDb.rows.length > 0 ? resDb.rows : (resDb.command + ' completed. Rows affected: ' + resDb.rowCount);

    res.json({ 
      status: "success", 
      executedSql: sql,
      duration: `${duration}ms`,
      result: resultData,
      message: "Запрос выполнен успешно"
    });

  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка выполнения SQL или подключения", 
      details: err.message 
    });
  } finally {
    // Корректное закрытие соединения
    if (client) {
        if (isCustomClient) {
            await client.end().catch(() => {}); // Закрываем отдельное соединение
        } else {
            client.release(); // Возвращаем в пул
        }
    }
  }
});

// Запуск фонового воркера
setInterval(() => runWorkerCycle(pool), 30000);

// Для всех остальных маршрутов отдаём index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Старт сервера
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});