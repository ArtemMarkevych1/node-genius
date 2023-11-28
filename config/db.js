const mongoose = require("mongoose");
const { URI } = require("./secret");

mongoose.connect(URI);