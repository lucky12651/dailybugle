const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const statsController = require("../controllers/statsController");

// URL shortening routes
router.post("/shorten", urlController.shorten);
router.get("/recent", urlController.getRecent);
router.get("/stats/:slug", urlController.getStats);

// Statistics routes
router.get("/stats/:slug/os", statsController.getOsStats);
router.get("/stats/:slug/device", statsController.getDeviceStats);
router.get("/stats/:slug/referrer", statsController.getReferrerStats);
router.get("/stats/:slug/bots", statsController.getBotStats);
router.get("/stats/:slug/traffic", statsController.getTrafficStats);
router.get("/stats/:slug/country", statsController.getCountryStats);

module.exports = router;
