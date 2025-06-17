const express = require("express");
const path = require("path");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Store visitor and location data (Note: In production, use a database instead)
let visitors = [];
let locations = [];
let permissionDenials = [];

// Function to check if visitor is unique within time window
function isUniqueVisitor(ip) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Check if this IP has visited in the last 30 minutes
  const recentVisit = visitors.find(
    (visitor) =>
      visitor.ip === ip && new Date(visitor.timestamp) > thirtyMinutesAgo
  );

  return !recentVisit;
}

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint for images
app.get("/api/images", (req, res) => {
  // Check if request is not from admin panel
  const referer = req.headers.referer || "";
  if (!referer.includes("/admin")) {
    const ip = req.ip || req.connection.remoteAddress;

    // Only log if this is a unique visitor within the time window
    if (isUniqueVisitor(ip)) {
      visitors.push({
        ip,
        timestamp: new Date().toISOString(),
      });
      console.log(`New unique visitor logged: ${ip}`);
    }
  }

  // Mock image data (same as in your HTML file)
  const images = [
    "https://placehold.co/800x600/FF5733/FFFFFF?text=Image+1",
    "https://placehold.co/900x700/33FF57/000000?text=Image+2",
    "https://placehold.co/700x500/5733FF/FFFFFF?text=Image+3",
    "https://placehold.co/1000x800/33A0FF/000000?text=Image+4",
    "https://placehold.co/600x900/FF33A0/FFFFFF?text=Image+5",
    "https://placehold.co/750x550/FFA033/000000?text=Image+6",
    "https://placehold.co/850x650/33FFAB/FFFFFF?text=Image+7",
    "https://placehold.co/650x750/AB33FF/000000?text=Image+8",
    "https://placehold.co/950x750/33A0FF/FFFFFF?text=Image+9",
    "https://placehold.co/700x900/FF3357/000000?text=Image+10",
    "https://placehold.co/800x600/FF5733/FFFFFF?text=Image+11",
    "https://placehold.co/900x700/33FF57/000000?text=Image+12",
    "https://placehold.co/700x500/5733FF/FFFFFF?text=Image+13",
    "https://placehold.co/1000x800/33A0FF/000000?text=Image+14",
    "https://placehold.co/600x900/FF33A0/FFFFFF?text=Image+15",
    "https://placehold.co/750x550/FFA033/000000?text=Image+16",
  ];
  res.json(images);
});

// API endpoint for location data
app.post("/api/location", (req, res) => {
  const { latitude, longitude } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  locations.push({
    ip,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

// API endpoint to store permission denials
app.post("/api/permission-denial", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  permissionDenials.push({
    ip,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// API endpoint to get visitors
app.get("/api/visitors", (req, res) => {
  res.json(visitors);
});

// API endpoint to get locations
app.get("/api/locations", (req, res) => {
  res.json(locations);
});

// API endpoint to get permission denials
app.get("/api/permission-denials", (req, res) => {
  res.json(permissionDenials);
});

// Route for terms page
app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "terms.html"));
});

// Route for admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Handle all other routes by serving index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// For local development, start the server
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running locally at http://localhost:${port}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
