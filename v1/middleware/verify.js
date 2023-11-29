import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";
import {SECRET_ACCESS_TOKEN} from "../config/index.js";

export async function VerifyIsLoggedIn(req, res, next) {

  const authHeader = req.headers["cookie"];

  if (!authHeader) return res.sendStatus(401);

  const cookie = authHeader.split("=")[1];

  const accessToken = cookie.split(";")[0];

  const checkIfBlacklisted = await Blacklist.findOne({token: accessToken});

  if (checkIfBlacklisted)
    return res
        .status(401)
        .json({message: "This session has expired. Please login"});

  jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
    if (err) {
      return res
          .status(401)
          .json({message: "This session has expired. Please login"});
    }

    const {id} = decoded;
    const user = await User.findById(id);
    const {password, ...data} = user._doc;
    req.user = data;
    next();
  });
}

export function VerifyRole(req, res, next) {
  try {
    const user = req.user;
    const {role} = user;

    console.log("===role", role)

    if (role !== "admin") {
      return res.status(401).json({
        status: "failed",
        message: "You are not authorized to view this page.",
      });
    }
    next();
  } catch (err) {
    console.log('===verifyRole error', err)
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}