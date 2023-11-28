// MongoDB Auth

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
require("./config/db");
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

function isValidEmail(email) {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      return res.status(400).json({
        message: "Invalid password",
      });
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

app.post("/login", async (req, res, next) => {
  try {
    // Find user by email
    const { email, password: pass } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Omit sensitive data from response
    const { password, ...userData } = user._doc;

    // Generate access token with expiration time
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response with user data and access token
    res.status(200).json({ ...userData, token });
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
