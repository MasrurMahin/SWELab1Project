const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    assignee TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, assignee } = req.body;
  const info = db.prepare('INSERT INTO tasks (title, assignee) VALUES (?, ?)').run(title, assignee);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/tasks/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.listen(3000, () => console.log('http://localhost:3000'));