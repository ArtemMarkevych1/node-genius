import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import {PORT, URI} from "./config/index.js";
import App from "./routes/index.js";

const server = express();

server.use(cors());
server.disable("x-powered-by"); //Reduce fingerprinting
server.use(cookieParser());
server.use(express.urlencoded({extended: false}));
server.use(express.json());

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(URI)
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));

server.use(App);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);