import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from './helperServer/db.js';
import { setupHandlers } from './helperServer/apiHandlers.js';
import { runWorkerCycle } from './helperServer/worker.js';
import { handleDbRequest } from './helperServer/dbGatewayController.js'; // Импорт нового контроллера

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

// --- DB API GATEWAY ---
// Поддержка GET для ссылок (как в AmoCRM /api/v4/leads)
app.get("/api/db-test", handleDbRequest);
// Поддержка POST для сложных запросов и UI
app.post("/api/db-test", handleDbRequest);

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