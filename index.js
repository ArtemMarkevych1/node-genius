const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const port = 3000;

const tasks = [
  {
    id: 1,
    text: 'Take out the trash',
    priority: 'low',
    dateAdded: new Date()
  },
  {
    id: 2,
    text: 'Walk the dog',
    priority: 'high',
    dateAdded: new Date()
  },
  {
    id: 3,
    text: 'Make dinner',
    priority: 'critical',
    dateAdded: new Date()
  }
];

let nextId = 4;

app.use(bodyParser.json())

function checkExist(task, res) {
  if (!task) {
    return res.status(404).send('Task not found');
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  checkExist(task, res);

  res.send(task);
});

app.post('/tasks', (req, res) => {
  // Get task data from request body
  const {text, priority} = req.body;

// Validate data
  if (!text || !priority) {
    return res.status(400).json({error: 'Text and priority are required'});
  }

// Create new task object
  const newTask = {
    id: nextId++,
    text,
    priority,
    dateAdded: new Date()
  };

  tasks.push(newTask);

  res.status(201).json(newTask)

  // Save to database

  // db.collection('tasks').insertOne(newTask, (err, result) => {
  //   if(err) {
  //     return res.status(500).json({error: err.message});
  //   }
  //   res.status(201).json(result.ops[0]);
  // });
});

app.put('/tasks/:id', (req, res) => {
  const updatedTask = req.body;
  const taskId = parseInt(req.params.id);

  const foundTask = tasks.find(task => task.id === taskId);

  checkExist(foundTask, res);

  foundTask.text = updatedTask.text;
  foundTask.priority = updatedTask.priority;

  return res.status(200).json(foundTask);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);

  const foundTask = tasks.find(task => task.id === taskId);

  checkExist(foundTask, res);

  const index = tasks.findIndex(task => task.id === taskId);

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});