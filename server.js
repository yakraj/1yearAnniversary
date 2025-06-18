const express = require("express");
const path = require("path");
const cors = require("cors");
const serverless = require("serverless-http"); // <- required wrapper for Vercel

const app = express();

app.use(cors());
app.use(express.json());

let visitors = [];
let locations = [];
let permissionDenials = [];

function isUniqueVisitor(ip) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const recentVisit = visitors.find(
    (visitor) =>
      visitor.ip === ip && new Date(visitor.timestamp) > thirtyMinutesAgo
  );
  return !recentVisit;
}

app.get("/api/images", (req, res) => {
  const referer = req.headers.referer || "";
  if (!referer.includes("/admin")) {
    const ip = req.ip || req.connection.remoteAddress;
    if (isUniqueVisitor(ip)) {
      visitors.push({ ip, timestamp: new Date().toISOString() });
      console.log(`New unique visitor logged: ${ip}`);
    }
  }

  const images = [/* your images here */];
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

app.get("/api/visitors", (req, res) => {
  res.json(visitors);
});

app.get("/api/locations", (req, res) => {
  res.json(locations);
});

app.get("/api/permission-denials", (req, res) => {
  res.json(permissionDenials);
});

// Wrap and export the app for Vercel
module.exports = serverless(app);
