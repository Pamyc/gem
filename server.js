import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./helperServer/db.js";
import { DB_SCHEMA } from "./helperServer/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Инициализация базы данных
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully.");
    
    for (const query of DB_SCHEMA) {
      await client.query(query);
    }
    console.log("Database schema initialized.");
    client.release();
  } catch (err) {
    console.warn("Database initialization warning (might be unreachable in this env):", err.message);
  }
}

// Запускаем инициализацию при старте, но не блокируем запуск сервера
initializeDatabase();

// Раздаём статические файлы из dist (после vite build)
app.use(express.static(path.join(__dirname, "dist")));

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

// Для всех остальных маршрутов отдаём index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});