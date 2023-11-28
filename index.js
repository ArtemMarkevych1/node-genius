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

function isValidEmail(email) {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

function isValidPassword(password) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/;
  return regex.test(password);
}

// Routes

app.post("/register", async (req, res, next) => {
  const { firstName, lastName, email, password: pass, role } = req.body;

  try {
    // Validate input
    if (!firstName) {
      return res.status(400).json({ message: "First name is required" });
    }
    if (!lastName) {
      return res.status(400).json({ message: "Last name is required" });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!pass || !isValidPassword(pass)) {
      return res.status(400).json({ message: "Password is not valid. It must be at least 6 characters long and contain at least one digit, one lowercase letter, and one uppercase letter." });
    }
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    // Ensure unique email address
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email address already in use" });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      role,
    });

    // Omit sensitive data from response
    const { password, ...userData } = user._doc;

    // Send response
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
