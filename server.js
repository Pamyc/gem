import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from './helperServer/db.js';
import { setupHandlers } from './helperServer/apiHandlers.js';
import { runWorkerCycle } from './helperServer/worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "dist")));

// Инициализация БД при запуске
async function initializeDatabase() {
    // Логика создания таблиц отключена для теста соединения
    console.log('[Server] Database initialization skipped (Connection Test Mode)');
    return Promise.resolve();
}

// Подключаем API обработчики (Telegram и пр.)
setupHandlers(app, pool);

// API Роут для теста соединения и шаблонов SQL
app.post("/api/db-test", async (req, res) => {
  const { action } = req.body;
  
  try {
    const client = await pool.connect();
    let queryResult;
    let message = "";
    let sql = "";

    if (action === 'insert') {
        const textVal = `Test entry ${new Date().toLocaleTimeString()}`;
        sql = "INSERT INTO test_connection (text) VALUES ($1) RETURNING *";
        const resDb = await client.query(sql, [textVal]);
        queryResult = resDb.rows[0];
        message = `Успешно добавлена запись (ID: ${queryResult.id})`;
    } else if (action === 'select') {
        sql = "SELECT * FROM test_connection ORDER BY id DESC LIMIT 5";
        const resDb = await client.query(sql);
        queryResult = resDb.rows;
        message = `Получено ${queryResult.length} последних записей`;
    } else {
        // Default: Time check
        sql = "SELECT NOW() as time";
        const resDb = await client.query(sql);
        queryResult = resDb.rows[0];
        message = "Успешное подключение (Время сервера)";
    }

    client.release();
    
    res.json({ 
      status: "success", 
      executedSql: sql,
      result: queryResult, 
      message 
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка выполнения запроса", 
      details: err.message 
    });
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