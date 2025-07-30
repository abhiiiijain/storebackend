const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { db } = require("./db/db");
const { readdirSync } = require("fs");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Session configuration with memory store for testing
app.use(session({
  secret: process.env.SESSION_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

readdirSync("./routes").map((route) =>
  app.use("/api/v1", require("./routes/" + route))
);

const server = () => {
  // Temporarily comment out database connection for testing
  // db();
  app.listen(PORT, () => {
    console.log("listening to port:", PORT);
  });
};

server();
