const express = require("express");
const db = require("./oracleNosql");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const UrlService = require("./services/urlService");

// Oracle NoSQL connection established via require('./oracleNosql')
console.log("Oracle NoSQL client initialized successfully");

// Skip table creation - assume tables exist (created manually in Oracle Cloud Console)
async function initializeTables() {
  try {
    // Just log that we expect tables to exist
    console.log(
      "Oracle NoSQL client initialized - expecting tables to exist in Oracle Cloud Console",
    );
  } catch (error) {
    // For Oracle NoSQL Cloud Always Free tier, tables need to be created via console first
    console.warn("=== DATABASE SETUP REQUIRED ===");
    console.warn(
      "Oracle NoSQL tables not found. Please create them in Oracle Cloud Console:",
    );
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
app.set("trust proxy", 1); // Trust first proxy only
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
app.get("/:slug([A-Za-z0-9-_]+)", async (req, res, next) => {
  const slug = req.params.slug;

  const blockedRoutes = ["api", "dashboard", "stats", "analytics", "recent"];
  if (blockedRoutes.includes(slug)) return next();

  try {
    const longUrl = await UrlService.handleRedirect(slug, req);

    if (!longUrl) return next();

    return res.redirect(301, longUrl);
  } catch (e) {
    console.error("Redirect error:", e);
    res.status(500).send("Server error");
  }
});

// ===============================
// 4. React Fallback
// ===============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
