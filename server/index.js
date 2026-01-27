const express = require("express");
const db = require("./postgresql");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const UrlService = require("./services/urlService");

// PostgreSQL client established via require('./postgresql')
console.log("Postgres client initialized successfully");

// Check basic connectivity - do not auto-create tables here. Use initDb.js to create schema.
async function initializeTables() {
  try {
    await require("./postgresql").query("SELECT 1");
    console.log(
      "Postgres connectivity verified - expecting tables to exist or run initDb.js to create them",
    );
  } catch (error) {
    console.warn("=== DATABASE SETUP REQUIRED ===");
    console.warn(
      "Could not connect to Postgres or tables are missing. Run node initDb.js to create the required tables.",
    );
    console.warn("Error:", error.message);
  }
}

// Initialize tables on startup
initializeTables();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  }),
);

// Apply rate limiting to all API routes
app.use("/api/", limiter);

// ===============================
// 1. Import Routes
// ===============================
const apiRoutes = require("./routes/api");
const healthRoutes = require("./routes/health");

// Mount routes
app.use("/api", apiRoutes);
app.use("/api/health", healthRoutes);

// ===============================
// 2. Serve React Build
// ===============================
app.use(express.static(path.join(__dirname, "../client/dist")));

// ===============================
// 3. Short URL Redirect (/slug)
// ===============================
const redirectHandler = async (req, res, next) => {
  const slug = req.params.slug;
  const userId = req.params.userId;

  const blockedRoutes = ["api", "dashboard", "stats", "analytics", "recent"];
  if (blockedRoutes.includes(slug)) return next();

  try {
    const longUrl = await UrlService.handleRedirect(slug, req, userId);

    if (!longUrl) return next();

    return res.redirect(301, longUrl);
  } catch (e) {
    console.error("Redirect error:", e);
    res.status(500).send("Server error");
  }
};

app.get("/:slug([A-Za-z0-9-_]+)", redirectHandler);
app.get("/:slug([A-Za-z0-9-_]+)/:userId([A-Za-z0-9-_]+)", redirectHandler);

// ===============================
// 4. React Fallback
// ===============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
