import express from "express";
import Auth from './auth.js';
import {VerifyIsLoggedIn, VerifyRole} from "../middleware/verify.js";

const app = express();

app.use('/v1/auth', Auth);

app.disable("x-powered-by"); // Reduce fingerprinting (optional)

app.get("/v1", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: [],
      message: "Welcome to our API homepage!",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/v1/user", VerifyIsLoggedIn, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the your Dashboard!",
  });
});

app.get("/v1/admin", VerifyIsLoggedIn, VerifyRole, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Admin portal!",
  });
});

export default app;