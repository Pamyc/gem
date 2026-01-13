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

// API Роут для теста соединения
app.get("/api/db-test", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as time");
    const time = result.rows[0].time;
    client.release();
    
    res.json({ 
      status: "success", 
      time, 
      message: "Успешное подключение к 192.168.0.4" 
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Ошибка подключения к БД", 
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