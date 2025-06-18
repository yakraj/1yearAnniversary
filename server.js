const express = require("express");
const path = require("path");
const cors = require("cors");
const serverless = require("serverless-http"); // <- important

const app = express();
app.use(cors());
app.use(express.json());

let visitors = [];
let locations = [];
let permissionDenials = [];

function isUniqueVisitor(ip) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return !visitors.find(
    (v) => v.ip === ip && new Date(v.timestamp) > thirtyMinutesAgo
  );
}

// Static files (won’t work the same on Vercel; see note below)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/images", (req, res) => {
  const referer = req.headers.referer || "";
  if (!referer.includes("/admin")) {
    const ip = req.ip || req.connection.remoteAddress;
    if (isUniqueVisitor(ip)) {
      visitors.push({ ip, timestamp: new Date().toISOString() });
      console.log(`New unique visitor logged: ${ip}`);
    }
  }

  const images = [/* same image array as before */];
  res.json(images);
});

app.post("/api/location", (req, res) => {
  const { latitude, longitude } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  locations.push({ ip, latitude, longitude, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.post("/api/permission-denial", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  permissionDenials.push({ ip, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.get("/api/visitors", (req, res) => res.json(visitors));
app.get("/api/locations", (req, res) => res.json(locations));
app.get("/api/permission-denials", (req, res) => res.json(permissionDenials));

app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "terms.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// DO NOT call app.listen()
// Export the handler for Vercel
module.exports = serverless(app);
