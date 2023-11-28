// MongoDB Auth

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("./config/db");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Helper functions
function checkExist(task) {
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
}

function serverError(res, err) {
  return res.status(500).json({ error: err });
}

function getObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid task ID");
  }
  return new mongoose.Types.ObjectId(id);
}

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    serverError(res, err);
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = getObjectId(req.params.id);
    const task = await Task.findById(taskId);
    checkExist(task);
    res.status(200).json(task);
  } catch (err) {
    serverError(res, err);
  }
});

app.post("/tasks", async (req, res) => {
  const { text, priority } = req.body;

  try {
    const task = await Task.create({ text, priority });
    res.status(201).json(task);
  } catch (err) {
    serverError(res, err);
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { text, priority } = req.body;
  const taskId = getObjectId(req.params.id);

  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { text, priority },
      { new: true }
    );
    checkExist(task);
    res.status(200).json(task);
  } catch (err) {
    serverError(res, err);
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const taskId = getObjectId(req.params.id);

  try {
    const task = await Task.findByIdAndDelete(taskId);
    checkExist(task);
    res.status(204).send();
  } catch (err) {
    serverError(res, err);
  }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
