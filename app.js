// app.js

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("App running with hardcoded secrets (for testing only)");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
