const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Auth routes
router.post("/auth/login", authController.login);
router.get("/auth/2fa-status", authController.check2FAStatus);
router.post("/auth/setup-2fa", authController.setup2FA);
router.post("/auth/verify-2fa", authController.verify2FA);
router.post("/auth/toggle-2fa-setup", authMiddleware, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    await require("../postgresql").query(
      "UPDATE settings SET setting_value = $1, updated_at = NOW() WHERE setting_key = 'allow_2fa_setup'",
      [enabled],
    );
    
    res.json({
      message: `2FA setup ${enabled ? "enabled" : "disabled"} successfully`,
      setupAllowed: enabled,
    });
  } catch (error) {
    console.error("Toggle 2FA setup error:", error);
    res.status(500).json({ error: "Failed to toggle 2FA setup" });
  }
});

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
