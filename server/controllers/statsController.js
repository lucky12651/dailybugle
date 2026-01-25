const StatsService = require("../services/statsService");

const statsController = {
  // GET /api/stats/:slug/os
  async getOsStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getOsStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("OS stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/device
  async getDeviceStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getDeviceStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("Device stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/referrer
  async getReferrerStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getReferrerStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("Referrer stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/bots
  async getBotStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getBotStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("Bot stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/traffic
  async getTrafficStats(req, res) {
    try {
      const { slug } = req.params;
      const { period = "7d" } = req.query;
      const stats = await StatsService.getTrafficStats(slug, period);
      res.json(stats);
    } catch (error) {
      console.error("Traffic stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/country
  async getCountryStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getCountryStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("Country stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/users
  async getUserStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await StatsService.getUserStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("User stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // GET /api/stats/:slug/users/:userId/traffic
  async getUserTrafficStats(req, res) {
    try {
      const { slug, userId } = req.params;
      const { period = "30d" } = req.query;
      const stats = await StatsService.getUserTrafficStats(slug, userId, period);
      res.json(stats);
    } catch (error) {
      console.error("User traffic stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = statsController;
