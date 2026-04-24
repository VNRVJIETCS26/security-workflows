// app.js

const express = require("express");
const jwt = require("jsonwebtoken");
const serialize = require("serialize-javascript");
const _ = require("lodash");
const child_process = require("child_process");
const mysql = require("mysql");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hardcoded secrets
const JWT_SECRET = "secret";
const API_KEY = "sk_test_51H8xExampleSecretKeyForScannerTrigger";
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// Hardcoded DB creds
const db = mysql.createConnection({
  host: "db.example.com",
  user: "admin",
  password: "Password123!",
  database: "app_db"
});

// No auth
app.get("/admin", (req, res) => {
  res.send("Admin panel without authentication");
});

// SQL Injection
app.get("/user", (req, res) => {
  const id = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + id;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// Command Injection
app.get("/ping", (req, res) => {
  const host = req.query.host;
  child_process.exec("ping -c 1 " + host, (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

// Reflected XSS
app.get("/search", (req, res) => {
  const q = req.query.q;
  res.send("<h1>Search result for: " + q + "</h1>");
});

// Insecure deserialization / unsafe object merge
app.post("/merge", (req, res) => {
  const user = {
    role: "user",
    isAdmin: false
  };

  _.merge(user, req.body);
  res.json(user);
});

// Weak JWT secret + long expiry
app.post("/login", (req, res) => {
  const token = jwt.sign(
    {
      username: req.body.username,
      role: "admin"
    },
    JWT_SECRET,
    {
      expiresIn: "365d",
      algorithm: "HS256"
    }
  );

  res.json({ token });
});

// Sensitive data exposure
app.get("/debug", (req, res) => {
  res.json({
    env: process.env,
    jwtSecret: JWT_SECRET,
    apiKey: API_KEY,
    awsAccessKey: AWS_ACCESS_KEY_ID,
    awsSecretKey: AWS_SECRET_ACCESS_KEY,
    dbPassword: "Password123!"
  });
});

// Unsafe serialize into HTML
app.get("/profile", (req, res) => {
  const name = req.query.name;

  const data = serialize({
    name: name
  });

  res.send(`
    <html>
      <body>
        <script>
          window.__USER__ = ${data}
        </script>
      </body>
    </html>
  `);
});

// Open redirect
app.get("/redirect", (req, res) => {
  res.redirect(req.query.url);
});

// Path traversal
app.get("/file", (req, res) => {
  const file = req.query.name;
  res.sendFile(__dirname + "/files/" + file);
});

// Weak CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.listen(3000, () => {
  console.log("Vulnerable app running on port 3000");
});
