import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("hunt.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    user_name TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  );
`);

// Seed initial tasks if empty
const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
if (taskCount.count === 0) {
  const insertTask = db.prepare("INSERT INTO tasks (title, description, points) VALUES (?, ?, ?)");
  const initialTasks = [
    ["Best Jalebi in Mirsharai Bazar", "Find the crispiest, juiciest Jalebi and snap a photo of the stall.", 15],
    ["Sunset at Mahamaya Lake", "Capture the golden hour at the beautiful Mahamaya Lake.", 20],
    ["Unique Mosque Lighting", "Find a mosque with beautiful or unique Ramadan decorations.", 15],
    ["Iftar Table Spread", "Show us your delicious home or restaurant Iftar spread.", 10],
    ["The Busy Bazar Rush", "Capture the energy of the Mirsarai Bazar just before Iftar.", 10],
    ["General Discovery", "Share any special moment or find from your Mirsarai journey.", 5]
  ];
  for (const task of initialTasks) {
    insertTask.run(task[0], task[1], task[2]);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks").all();
    res.json(tasks);
  });

  app.get("/api/feed", (req, res) => {
    const feed = db.prepare(`
      SELECT u.*, t.title as task_title 
      FROM uploads u 
      JOIN tasks t ON u.task_id = t.id 
      ORDER BY u.created_at DESC
    `).all();
    res.json(feed);
  });

  app.post("/api/upload", (req, res) => {
    const { taskId, userName, photoData, caption } = req.body;
    
    // In a real app, we'd save to cloud storage. 
    // Here we'll just store the base64 for simplicity in this environment.
    const stmt = db.prepare("INSERT INTO uploads (task_id, user_name, photo_url, caption) VALUES (?, ?, ?, ?)");
    const info = stmt.run(taskId, userName, photoData, caption);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/vote/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE uploads SET votes = votes + 1 WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
