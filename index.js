const express = require("express");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const router = require("./Router/router");

dotenv.config();

// essential variables
const port = process.env.PORT || 3000;
const mongodbUrl = process.env.MONGODB_URL || "mongodb://localhost/tweet-clone";

// database set up
mongoose.connect(mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database is connected successfully...");
});

// router set up
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(router);

server.listen(port, () => {
  console.log(`Listening to http://localhost:${port}...`);
});
