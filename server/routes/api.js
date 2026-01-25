const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Auth routes
router.post("/auth/login", authController.login);

// URL shortening routes (Protected)
router.post("/shorten", authMiddleware, urlController.shorten);
router.get("/recent", authMiddleware, urlController.getRecent);
router.get("/stats/:slug", authMiddleware, urlController.getStats);
router.get(
  "/stats/:slug/clicks",
  authMiddleware,
  urlController.getClickDetails,
);

// Statistics routes (Protected)
router.get("/stats/:slug/os", authMiddleware, statsController.getOsStats);
router.get(
  "/stats/:slug/device",
  authMiddleware,
  statsController.getDeviceStats,
);
router.get(
  "/stats/:slug/referrer",
  authMiddleware,
  statsController.getReferrerStats,
);
router.get("/stats/:slug/bots", authMiddleware, statsController.getBotStats);
router.get(
  "/stats/:slug/traffic",
  authMiddleware,
  statsController.getTrafficStats,
);
router.get(
  "/stats/:slug/country",
  authMiddleware,
  statsController.getCountryStats,
);
router.get("/stats/:slug/users", authMiddleware, statsController.getUserStats);
router.get(
  "/stats/:slug/users/:userId/traffic",
  authMiddleware,
  statsController.getUserTrafficStats,
);

module.exports = router;
