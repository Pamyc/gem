import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 1) Основные статические файлы из dist (vite build)
app.use(express.static(path.join(__dirname, "dist")));

// 2) Дополнительно раздаём public, чтобы /oktbr_park.jpg точно был доступен
app.use(express.static(path.join(__dirname, "public")));

// 3) Для всех остальных маршрутов — index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
