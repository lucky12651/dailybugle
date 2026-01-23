const UrlModel = require("../models/Url");
const ClickModel = require("../models/Click");
const {
  generateRandomSlug,
  detectBot,
  parseDeviceInfoFromUA,
} = require("./helperService");
const geoip = require("geoip-lite");
const crypto = require("crypto");

// Ensure BASE_URL is defined
if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is not defined in environment variables");
}

const BASE_URL = process.env.BASE_URL;

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
        shortUrl: `${BASE_URL}/${urlData.slug}`,
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

      const clickDetails = await ClickModel.findBySlug(slug);

      const processedClicks = clickDetails
        .map((c) => {
          let location = c.location || "Unknown";

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
            timestamp: c.timestamp
              ? new Date(c.timestamp).toISOString()
              : null,
            ip: c.ip || null,
            location,
            userAgent: c.userAgent || null,
            referer: c.referer || null,
            isBot: c.isBot || false,
            deviceInfo: c.deviceInfo || {
              deviceType: "Unknown",
              os: "Unknown",
              browser: "Unknown",
            },
          };
        })
        .sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

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

  static async getRecentUrls(limit = 20) {
    try {
      const urls = await UrlModel.findAll({ limit });

      return urls.map((data) => ({
        slug: data.slug,
        longUrl: data.longUrl,
        clicks: data.clicks || 0,
        shortUrl: `${BASE_URL}/${data.slug}`,
        createdAt: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : null,
      }));
    } catch (error) {
      throw error;
    }
  }

  static async handleRedirect(slug, req) {
    try {
      const urlData = await UrlModel.findBySlug(slug);
      if (!urlData) {
        return null;
      }

      const userAgent = req.get("User-Agent") || "";
      let ip =
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null;

      if (ip && ip.includes("::ffff:")) {
        ip = ip.replace("::ffff:", "");
      }

      const deviceInfo = parseDeviceInfoFromUA(userAgent);
      const botDetection = detectBot(userAgent);
      const geo = geoip.lookup(ip);
      const country = geo ? geo.country : null;

      let location = "Unknown";
      if (geo) {
        const countryName = ClickModel.getCountryName(geo.country);
        const region = geo.region || geo.city || "Unknown Region";
        location = `${region}, ${countryName}`;
      }

      await Promise.all([
        UrlModel.incrementClicks(slug),
        ClickModel.create({
          slug,
          ip,
          userAgent,
          referer: req.get("Referer") || "",
          country,
          location,
          isBot: botDetection.isBot,
          botCategory: botDetection.category,
          botName: botDetection.name,
          deviceInfo,
        }),
      ]);

      return urlData.longUrl;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UrlService;
