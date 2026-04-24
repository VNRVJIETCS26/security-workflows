// vuln-app.js

const express = require("express");
const serialize = require("serialize-javascript");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const app = express();
app.use(express.json());

// Vulnerable dependency usage: old serialize-javascript versions had XSS issues
app.get("/serialize", (req, res) => {
  const userInput = req.query.name || "<script>alert(1)</script>";

  const serialized = serialize({
    name: userInput
  });

  res.send(`
    <html>
      <body>
        <script>
          window.__DATA__ = ${serialized}
        </script>
      </body>
    </html>
  `);
});

// Weak JWT secret
const JWT_SECRET = "secret";

app.post("/login", (req, res) => {
  const token = jwt.sign(
    { user: req.body.username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

// Prototype pollution-style unsafe merge
app.post("/merge", (req, res) => {
  const defaults = {
    role: "user",
    permissions: []
  };

  const merged = _.merge(defaults, req.body);

  res.json(merged);
});

// Information disclosure
app.get("/debug", (req, res) => {
  res.json({
    env: process.env,
    secret: JWT_SECRET
  });
});

app.listen(3000, () => {
  console.log("Vulnerable test app running on port 3000");
});
