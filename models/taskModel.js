const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Task description is required"],
  },
  priority: {
    type: String,
    required: [true, "Task description is required"],
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = { 
  Task 
};
