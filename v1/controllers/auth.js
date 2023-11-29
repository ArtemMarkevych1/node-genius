import User from "../models/User.js";
import Blacklist from '../models/Blacklist.js';
import bcrypt from "bcrypt";

export async function Register(req, res) {
  const {firstName, lastName, email, password: pass, role} = req.body;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pass, salt);

  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hash,
      role
    });

    const existingUser = await User.findOne({email});

    if (existingUser)
      return res.status(400).json({
        status: "failed",
        data: [],
        message: "It seems you already have an account, please log in instead.",
      });

    const savedUser = await newUser.save();

    const {password, ...userData} = savedUser._doc;

    res.status(200).json({
      status: "success",
      data: [userData],
      message:
          "Thank you for registering with us. Your account has been successfully created.",
    });
  } catch (err) {
    console.log("==err", err)
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}

export async function Login(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({
        status: "failed",
        data: [],
        message: "Account does not exist",
      });

    const isPasswordValid = bcrypt.compare(
        `${req.body.password}`,
        user.password
    );

    if (!isPasswordValid)
      return res.status(401).json({
        status: "failed",
        data: [],
        message:
            "Invalid email or password. Please try again with the correct credentials.",
      });

    let options = {
      maxAge: 20 * 60 * 1000, // would expire in 20minutes
      httpOnly: true, // The cookie is only accessible by the web server
      secure: true,
      sameSite: "None",
    };

    const token = user.generateAccessJWT();
    res.cookie("SessionID", token, options);
    res.status(200).json({
      status: "success",
      message: "You have successfully logged in.",
    });

  } catch (err) {
    console.log("===err", err)
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}

export async function Logout(req, res) {
  try {
    const authHeader = req.headers['cookie']; // get the session cookie from request header
    if (!authHeader) return res.sendStatus(204); // No content
    const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
    const accessToken = cookie.split(';')[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    const newBlacklist = new Blacklist({
      token: accessToken,
    });
    await newBlacklist.save();
    // Also clear request cookie on client
    res.setHeader('Clear-Site-Data', '"cookies"');
    res.status(200).json({ message: 'You are logged out!' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
  res.end();
}