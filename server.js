import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ЛОГИ (можно оставить, не мешают)
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// Глушим служебный запрос Bitrix (/favicon.ico)
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Статика (vite build)
app.use(express.static(path.join(__dirname, "dist")));

// Корень — важно для Bitrix iframe
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// SPA fallback — как было
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
