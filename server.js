import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Логи (можно потом убрать)
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// Чтобы POST с form-urlencoded не ломал чтение body (Bitrix так шлёт)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Глушим favicon
app.all("/favicon.ico", (req, res) => res.status(204).end());

// Статика (vite build)
app.use(express.static(path.join(__dirname, "dist")));

// Отдаём index.html на ЛЮБОЙ метод для корня (важно для Bitrix POST)
app.all("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// SPA fallback на ЛЮБОЙ метод (включая POST)
app.all("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
