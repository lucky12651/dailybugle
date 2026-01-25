const UrlModel = require("../models/Url");
const ClickModel = require("../models/Click");
const {
  generateRandomSlug,
  detectBot,
  parseDeviceInfoFromUA,
} = require("./helperService");
const geoip = require("geoip-lite");

class UrlService {
  static async shortenUrl({ longUrl, customSlug }) {
    try {
      let slug = customSlug || generateRandomSlug();

      if (customSlug) {
        const exists = await UrlModel.exists(slug);
        if (exists) {
          throw new Error("Custom slug already exists");
        }
      }

      const urlData = await UrlModel.create({ slug, longUrl });

      return {
        slug: urlData.slug,
        longUrl: urlData.longUrl,
        shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${
          urlData.slug
        }`,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUrlWithStats(slug) {
    try {
      const urlData = await UrlModel.findBySlug(slug);
      if (!urlData) {
        throw new Error("URL not found");
      }

      // Initial load: Get first 25 clicks
      const clickDetails = await ClickModel.findBySlug(slug, 25, 0);

      // Process click details with location information
      const processedClicks = this._processClickDetails(clickDetails);

      return {
        slug: urlData.slug,
        longUrl: urlData.longUrl,
        clicks: urlData.clicks || 0,
        createdAt: urlData.createdAt
          ? new Date(urlData.createdAt).toISOString()
          : null,
        clickDetails: processedClicks,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getClickDetails(slug, limit = 25, offset = 0) {
    try {
      const clickDetails = await ClickModel.findBySlug(slug, limit, offset);
      return this._processClickDetails(clickDetails);
    } catch (error) {
      throw error;
    }
  }

  static _processClickDetails(clickDetails) {
    return clickDetails.map((c) => {
      // Get location information from IP (backward compatibility)
      let location = c.location || "Unknown"; // Use stored location if available
      if (location === "Unknown" && c.ip) {
        const geo = geoip.lookup(c.ip);
        if (geo) {
          const countryName = ClickModel.getCountryName(geo.country);
          const region = geo.region || geo.city || "Unknown";
          location = `${region}, ${countryName}`;
        }
      }

      return {
        id: c.id || crypto.randomUUID(),
        timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : null,
        ip: c.ip || null,
        location: location, // Human-readable location
        userAgent: c.userAgent || null,
        referer: c.referer || null,
        isBot: c.isBot || false,
        deviceInfo: c.deviceInfo || {
          deviceType: "Unknown",
          os: "Unknown",
          browser: "Unknown",
        },
        userId: c.userId || null,
      };
    });
  }

  static async getRecentUrls(limit = 25, offset = 0) {
    try {
      const urls = await UrlModel.findAll({ limit, offset });

      return urls.map((data) => ({
        slug: data.slug,
        longUrl: data.longUrl,
        clicks: data.clicks || 0,
        shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${
          data.slug
        }`,
        createdAt: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : null,
      }));
    } catch (error) {
      throw error;
    }
  }

  static async handleRedirect(slug, req, userId = null) {
    try {
      const urlData = await UrlModel.findBySlug(slug);
      if (!urlData) {
        return null; // Indicate that URL was not found
      }

      // Extract request information
      const userAgent = req.get("User-Agent") || "";
      const ip =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        null;

      const deviceInfo = parseDeviceInfoFromUA(userAgent);
      const botDetection = detectBot(userAgent);
      let cleanIP = ip;
      if (cleanIP && cleanIP.includes("::ffff:")) {
        cleanIP = cleanIP.replace("::ffff:", "");
      }
      const geo = geoip.lookup(cleanIP);
      const country = geo ? geo.country : null;

      // Compute human-readable location
      let location = "Unknown";
      if (geo) {
        const countryName = ClickModel.getCountryName(geo.country);
        const region = geo.region || geo.city || "Unknown Region";
        location = `${region}, ${countryName}`;
      }

      // Increment click count and save analytics
      try {
        await Promise.all([
          UrlModel.incrementClicks(slug),
          ClickModel.create({
            slug,
            ip: cleanIP,
            userAgent,
            referer: req.get("Referer") || "",
            country,
            location,
            isBot: botDetection.isBot,
            botCategory: botDetection.category,
            botName: botDetection.name,
            deviceInfo,
            userId,
          }),
        ]);
      } catch (clickError) {
        console.error("Error saving click data:", clickError);
        // Continue even if click tracking fails, so the user still gets redirected
      }

      return urlData.longUrl;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UrlService;
