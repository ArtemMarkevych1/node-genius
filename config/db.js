const mongoose = require("mongoose");
const { URI } = require("./secret");

mongoose
  .connect(URI)
  .then(() => console.log("Connected to DB"))
  .catch((error) => console.log(error));
