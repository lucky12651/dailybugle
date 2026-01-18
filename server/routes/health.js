const express = require("express");
const db = require("../oracleNosql");
const router = express.Router();

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Test DB connection
    const result = await db.query("SELECT COUNT(*)::int AS count FROM urls");

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      postgres: "connected",
      count: result.rows[0].count || 0,
      environment: {
        BASE_URL: process.env.BASE_URL || "NOT SET",
        NODE_ENV: process.env.NODE_ENV || "NOT SET",
        PORT: process.env.PORT || "3000",
      },
    });
  } catch (error) {
    // If table doesn't exist yet, consider it healthy since we can connect
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        postgres: "connected",
        count: 0,
        environment: {
          BASE_URL: process.env.BASE_URL || "NOT SET",
          NODE_ENV: process.env.NODE_ENV || "NOT SET",
          PORT: process.env.PORT || "3000",
        },
      });
    } else {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
});

module.exports = router;
