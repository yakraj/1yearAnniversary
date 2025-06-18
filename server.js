const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

let visitors = [];
let locations = [];
let permissionDenials = [];

function isUniqueVisitor(ip) {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  return !visitors.some(v => v.ip === ip && new Date(v.timestamp) > thirtyMinAgo);
}

app.get("/api/images", (req, res) => {
  const referer = req.headers.referer || "";
  if (!referer.includes("/admin")) {
    const ip = req.ip;
    if (isUniqueVisitor(ip)) {
      visitors.push({ ip, timestamp: new Date().toISOString() });
    }
  }
  res.json([/* your images array */]);
});

app.post("/api/location", (req, res) => {
  const { latitude, longitude } = req.body;
  locations.push({ ip: req.ip, latitude, longitude, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.post("/api/permission-denial", (req, res) => {
  permissionDenials.push({ ip: req.ip, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.get("/api/visitors", (req, res) => res.json(visitors));
app.get("/api/locations", (req, res) => res.json(locations));
app.get("/api/permission-denials", (req, res) => res.json(permissionDenials));

// Serve static files from public/
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("/terms", (req, res) => res.sendFile(path.join(__dirname, "public", "terms.html")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

module.exports = serverless(app);
