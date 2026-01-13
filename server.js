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
    // Логика создания таблиц отключена для теста соединения,
    // но можно раскомментировать для авто-создания таблицы test
    // const client = await pool.connect();
    // try {
    //    for(const q of DB_SCHEMA) await client.query(q);
    // } finally { client.release(); }
    console.log('[Server] Database initialization skipped (Connection Test Mode)');
    return Promise.resolve();
}

// Подключаем API обработчики (Telegram и пр.)
setupHandlers(app, pool);

// API Роут для выполнения произвольного SQL
app.post("/api/db-test", async (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
      return res.status(400).json({ status: "error", message: "SQL query is required" });
  }

  try {
    const client = await pool.connect();
    const startTime = Date.now();
    
    // Выполняем произвольный запрос
    const resDb = await client.query(sql);
    
    const duration = Date.now() - startTime;
    client.release();
    
    // Определяем тип результата (массив строк или результат команды)
    const resultData = resDb.rows.length > 0 ? resDb.rows : (resDb.command + ' completed. Rows affected: ' + resDb.rowCount);

    res.json({ 
      status: "success", 
      executedSql: sql,
      duration: `${duration}ms`,
      result: resultData,
      message: "Запрос выполнен успешно"
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка выполнения SQL", 
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