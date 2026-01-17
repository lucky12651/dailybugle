const UrlService = require("../services/urlService");
const { generateRandomSlug } = require("../services/helperService");

const urlController = {
  // POST /api/shorten
  async shorten(req, res) {
    try {
      console.log("Shorten request received:", req.body);

      const { longUrl, customSlug } = req.body;

      if (!longUrl) {
        console.log("Missing longUrl in request");
        return res.status(400).json({ error: "Long URL required" });
      }

      try {
        new URL(longUrl);
      } catch (urlError) {
        console.log("Invalid URL provided:", longUrl, urlError.message);
        return res.status(400).json({ error: "Invalid URL" });
      }

      const result = await UrlService.shortenUrl({ longUrl, customSlug });

      res.json(result);
    } catch (error) {
      console.error("=== SHORTEN ENDPOINT ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Request body:", req.body);
      console.error("================================");

      // Check if it's a custom slug conflict
      if (error.message.includes("Custom slug already exists")) {
        return res.status(409).json({ error: "Custom slug already exists" });
      }

      // Check if it's a database issue
      if (
        error.code === "TABLE_NOT_FOUND" ||
        error.message.includes("not found")
      ) {
        console.error(
          "URLs table does not exist. Please create the tables in Oracle NoSQL Cloud console first.",
        );
        return res.status(503).json({
          error: "Database tables not initialized",
          message: "Please contact administrator to create Oracle NoSQL tables",
        });
      }

      // More descriptive error response
      res.status(500).json({
        error: "Server error",
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // GET /api/recent
  async getRecent(req, res) {
    try {
      console.log("Recent links request received");

      const list = await UrlService.getRecentUrls(20);

      console.log("Returning", list.length, "recent links");
      res.json(list);
    } catch (error) {
      console.error("=== RECENT LINKS ERROR ===");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);
      console.error("===========================");

      // Return empty array if table doesn't exist yet
      if (
        error.code === "TABLE_NOT_FOUND" ||
        error.message.includes("not found")
      ) {
        console.log("Returning empty recent links list (table not ready)");
        res.json([]);
      } else {
        res.status(500).json({
          error: "Server error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  },

  // GET /api/stats/:slug
  async getStats(req, res) {
    try {
      const { slug } = req.params;

      const stats = await UrlService.getUrlWithStats(slug);
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);

      if (error.message === "URL not found") {
        return res.status(404).json({ error: "URL not found" });
      }

      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = urlController;
