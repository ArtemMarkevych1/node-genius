// MongoDB Auth

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
require("./config/db");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Routes

app.post("/register", async (req, res, next) => {

  const { firstName, lastName, email, password, role } = req.body;

  try {
    
    // Validate input
    if(!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({message: 'All fields are required'});
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName, 
      lastName,
      email,
      password: hash,
      role 
    });

    // Omit sensitive data from response
    const {password, ...userData} = user._doc;

    // Send response
    res.status(201).json(userData);

  } catch (error) {
    next(error);
  }

});

app.listen(port, () => console.log(`Server started on port ${port}`));
