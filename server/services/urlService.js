const UrlModel = require("../models/Url");
const ClickModel = require("../models/Click");
const {
  generateRandomSlug,
  detectBot,
  parseDeviceInfoFromUA,
} = require("./helperService");

const geoip = require("geoip-lite");
const net = require("net");
const crypto = require("crypto");

/* ---------------- IP UTILITIES (AUTHORITATIVE) ---------------- */

function getClientIp(req) {
  return (
    req.headers["cf-connecting-ip"] || // Cloudflare
    req.headers["x-real-ip"] || // NGINX
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || // Proxies
    req.socket?.remoteAddress ||
    null
  );
}

function normalizeIp(ip) {
  if (!ip) return null;

  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");

  return net.isIP(ip) ? ip : null;
}

/* -------------------------------------------------------------- */

class UrlService {
  /* ---------------- URL SHORTEN ---------------- */

  static async shortenUrl({ longUrl, customSlug }) {
    let slug = customSlug || generateRandomSlug();

    if (customSlug) {
      const exists = await UrlModel.exists(slug);
      if (exists) throw new Error("Custom slug already exists");
    }

    const urlData = await UrlModel.create({ slug, longUrl });

    return {
      slug: urlData.slug,
      longUrl: urlData.longUrl,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${slug}`,
    };
  }

  /* ---------------- FETCH URL + STATS ---------------- */

  static async getUrlWithStats(slug) {
    const urlData = await UrlModel.findBySlug(slug);
    if (!urlData) throw new Error("URL not found");

    const clickDetails = await ClickModel.findBySlug(slug, 25, 0);
    const processedClicks = await this._processClickDetails(clickDetails);

    return {
      slug: urlData.slug,
      longUrl: urlData.longUrl,
      clicks: urlData.clicks || 0,
      createdAt: urlData.createdAt
        ? new Date(urlData.createdAt).toISOString()
        : null,
      clickDetails: processedClicks,
    };
  }

  static async getClickDetails(slug, limit = 25, offset = 0) {
    const clickDetails = await ClickModel.findBySlug(slug, limit, offset);
    return this._processClickDetails(clickDetails);
  }

  /* ---------------- CLICK PROCESSING ---------------- */

  static async _processClickDetails(clickDetails) {
    return Promise.all(
      clickDetails.map(async (c) => {
        let location = c.location || "Unknown";

        if (location === "Unknown" && c.ip && c.ip !== "127.0.0.1") {
          const geo = geoip.lookup(c.ip);
          if (geo) {
            const region = geo.region || geo.city || "Unknown";
            const country = ClickModel.getCountryName(geo.country);
            location = `${region}, ${country}`;
          }
        }

        return {
          id: c.id || crypto.randomUUID(),
          timestamp: c.timestamp,
          ip: c.ip,
          location,
          userAgent: c.userAgent,
          referer: c.referer,
          isBot: c.isBot || false,
          deviceInfo: c.deviceInfo || {
            deviceType: "Unknown",
            os: "Unknown",
            browser: "Unknown",
          },
          userId: c.userId || null,
        };
      }),
    );
  }

  /* ---------------- REDIRECT + TRACK ---------------- */

  static async handleRedirect(slug, req, userId = null) {
    const urlData = await UrlModel.findBySlug(slug);
    if (!urlData) return null;

    const userAgent = req.get("User-Agent") || "";
    const rawIp = getClientIp(req);
    const cleanIP = normalizeIp(rawIp);

    const deviceInfo = parseDeviceInfoFromUA(userAgent);
    const botDetection = detectBot(userAgent);

    let geo = null;
    if (cleanIP && cleanIP !== "127.0.0.1") {
      geo = geoip.lookup(cleanIP);
    }

    const country = geo?.country || null;

    let location = "Unknown";
    if (geo) {
      const region = geo.region || geo.city || "Unknown";
      const countryName = ClickModel.getCountryName(geo.country);
      location = `${region}, ${countryName}`;
    }

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
    } catch (err) {
      console.error("Click tracking failed:", err);
    }

    return urlData.longUrl;
  }

  /* ---------------- RECENT URLS ---------------- */

  static async getRecentUrls(limit = 25, offset = 0) {
    const urls = await UrlModel.findAll({ limit, offset });

    return urls.map((data) => ({
      slug: data.slug,
      longUrl: data.longUrl,
      clicks: data.clicks || 0,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${data.slug}`,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : null,
    }));
  }
}

module.exports = UrlService;
