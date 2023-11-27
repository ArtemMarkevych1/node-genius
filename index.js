const express = require('express');
const app = express();

const sqlite3 = require("sqlite3")
const bodyParser = require("body-parser");
const db = new sqlite3.Database("tasks.db");

const port = 3000;

app.use(bodyParser.json())

function checkExist(task, res) {
  if (!task) {
    return res.status(404).send('Task not found');
  }
}

function serverError(res, error) {
  if (error) {
    res.status(500).json({ error: error.message });
  }
}


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      text TEXT,
      priority TEXT
    )
  `);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", (error, rows) => {
    serverError(res, error);
    res.json(rows);
  });
});

// GET SINGLE TASK
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.get("SELECT * FROM tasks WHERE id = ?", [id], (error, row) => {
    serverError(res, error);
    checkExist(row, id);
    res.json(row);
  });
});

// CREATE TASK
app.post("/tasks", (req, res) => {
  const { text, priority } = req.body;

  db.run(
    "INSERT INTO tasks (text, priority) VALUES (?, ?)",
    [text, priority],
    function (error) {
      serverError(res, error);
      res.status(201).json({ id: this.lastID });
    }
  );
});

// UPDATE TASK
app.put("/tasks/:id", (req, res) => {
  const { text, priority } = req.body;
  const id = parseInt(req.params.id);

  db.run(
    `UPDATE tasks SET text = ?, priority = ? WHERE id = ?`,
    [text, priority, id],
    function (error) {
      serverError(res, error);
      res.sendStatus(200).json({id, text});
    }
  );
});

// DELETE TASK
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (error) {
    serverError(res, error);
    res.send(204);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
