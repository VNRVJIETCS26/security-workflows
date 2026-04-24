// app.js

const express = require("express");
const app = express();

// ❌ Hardcoded AWS credentials (should trigger scanners)
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// ❌ GitHub token
const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD";

// ❌ Slack bot token
const SLACK_TOKEN = "xoxb-123456789012-123456789012-abcdefghijklmnopqrstuvwx";

// ❌ Generic API key
const API_KEY = "sk_test_51H8xExampleSecretKeyForScannerTrigger";

// ❌ Hardcoded DB credentials
const DB_CONFIG = {
  host: "db.example.com",
  user: "admin",
  password: "Password123!",
  database: "app_db",
};

// ❌ JWT secret
const JWT_SECRET = "super-secret-jwt-key";

// ❌ Private key (dummy)
const PRIVATE_KEY = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAtesttesttesttesttesttesttesttesttesttesttesttest
testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
-----END RSA PRIVATE KEY-----
`;

app.get("/", (req, res) => {
  res.send("App running with hardcoded secrets (for testing only)");
});

app.get("/debug", (req, res) => {
  // ❌ accidental exposure
  res.json({
    awsKey: AWS_ACCESS_KEY_ID,
    github: GITHUB_TOKEN,
    dbUser: DB_CONFIG.user,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
