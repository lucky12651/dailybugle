const express = require("express");
const db = require("./oracleNosql");
const crypto = require("crypto");
require("dotenv").config();
const cors = require("cors");
const geoip = require("geoip-lite");
const path = require("path");
const rateLimit = require("express-rate-limit");

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
    console.warn("1. Go to Oracle Cloud Console → Database → NoSQL Database");
    console.warn("2. Create table 'urls' with slug (STRING) as primary key");
    console.warn("3. Create table 'clicks' with id (STRING) as primary key");
    console.warn("See migration guide for complete table schemas.");
    console.warn("Error details:", error.message);
    console.log("Server starting with database initialization pending...");
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
// 1. Serve React Build
// ===============================
app.use(express.static(path.join(__dirname, "../client/dist")));

// ===============================
// 2. Helper Functions
// ===============================

// Random slug
function generateRandomSlug(len = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// Enhanced Bot detection with categorization
function detectBot(ua = "") {
  const userAgent = ua.toLowerCase();

  // Social Media Bots
  if (userAgent.includes("redditbot") || userAgent.includes("reddit"))
    return { isBot: true, category: "Social Media", name: "Reddit Bot" };
  if (
    userAgent.includes("facebookexternalhit") ||
    userAgent.includes("facebook")
  )
    return { isBot: true, category: "Social Media", name: "Facebook Bot" };
  if (userAgent.includes("twitterbot") || userAgent.includes("twitter"))
    return { isBot: true, category: "Social Media", name: "Twitter Bot" };
  if (userAgent.includes("discordbot") || userAgent.includes("discord"))
    return { isBot: true, category: "Social Media", name: "Discord Bot" };

  // Search Engine Bots
  if (userAgent.includes("googlebot") || userAgent.includes("google"))
    return { isBot: true, category: "Search Engine", name: "Google Bot" };
  if (userAgent.includes("bingbot") || userAgent.includes("bing"))
    return { isBot: true, category: "Search Engine", name: "Bing Bot" };
  if (userAgent.includes("yandex"))
    return { isBot: true, category: "Search Engine", name: "Yandex Bot" };

  // General Bots
  if (userAgent.includes("bot"))
    return { isBot: true, category: "General", name: "Generic Bot" };
  if (userAgent.includes("crawl"))
    return { isBot: true, category: "General", name: "Crawler" };
  if (userAgent.includes("spider"))
    return { isBot: true, category: "General", name: "Spider" };

  // Social Platform Bots
  if (userAgent.includes("pinterest"))
    return { isBot: true, category: "Social Media", name: "Pinterest Bot" };
  if (userAgent.includes("linkedin"))
    return { isBot: true, category: "Social Media", name: "LinkedIn Bot" };
  if (userAgent.includes("slack"))
    return { isBot: true, category: "Social Media", name: "Slack Bot" };

  // QA/Forum Bots
  if (userAgent.includes("quora"))
    return { isBot: true, category: "QA Platform", name: "Quora Bot" };
  if (userAgent.includes("stackoverflow"))
    return { isBot: true, category: "QA Platform", name: "Stack Overflow Bot" };

  // Other known bots
  if (userAgent.includes("whatsapp"))
    return { isBot: true, category: "Messaging", name: "WhatsApp Bot" };
  if (userAgent.includes("telegram"))
    return { isBot: true, category: "Messaging", name: "Telegram Bot" };

  return { isBot: false, category: "Human", name: "Human User" };
}

// Backward compatibility function
function isBot(ua = "") {
  return detectBot(ua).isBot;
}

// Parse Device Info (Frontend expects this)
function parseDeviceInfoFromUA(userAgent = "") {
  const ua = userAgent.toLowerCase();

  // Device type
  let deviceType = "Desktop";
  if (ua.includes("mobile")) deviceType = "Mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) deviceType = "Tablet";

  // OS detection
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  // Browser detection
  let browser = "Unknown";
  if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";

  return { deviceType, os, browser };
}

// ===============================
// 3. API ROUTES
// ===============================

// POST /api/shorten
app.post("/api/shorten", async (req, res) => {
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

    let slug = customSlug || generateRandomSlug();
    console.log("Generated slug:", slug);

    if (customSlug) {
      console.log("Checking if custom slug exists:", slug);
      try {
        const result = await db.query(`
          SELECT * FROM urls WHERE slug = '${slug}'
        `);

        if (result.rows.length > 0) {
          console.log("Custom slug already exists:", slug);
          return res.status(409).json({ error: "Custom slug already exists" });
        }
      } catch (error) {
        console.log(
          "Slug does not exist or table not ready, proceeding with creation",
          error.message,
        );
      }
    }

    console.log("Creating new URL document");
    try {
      const now = new Date().toISOString();
      await db.query(`
        INSERT INTO urls VALUES (
          '${slug}',
          '${longUrl}',
          0,
          '${now}',
          '${now}'
        )
      `);
    } catch (error) {
      // If table doesn't exist, log and return appropriate error
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
      } else {
        console.error("Error creating URL document:", error);
        return res.status(500).json({ error: "Failed to create short URL" });
      }
    }

    const baseUrl = process.env.BASE_URL || "https://dailybugle.tech";
    console.log("Using base URL:", baseUrl);

    const shortUrl = `${baseUrl}/${slug}`;
    console.log("Generated short URL:", shortUrl);

    res.json({ slug, longUrl, shortUrl });
  } catch (e) {
    console.error("=== SHORTEN ENDPOINT ERROR ===");
    console.error("Error type:", e.constructor.name);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    console.error("Request body:", req.body);
    console.error("================================");

    // More descriptive error response
    res.status(500).json({
      error: "Server error",
      message: e.message,
      type: e.constructor.name,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/stats/:slug/os
app.get("/api/stats/:slug/os", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Count OS distribution
    const osCount = {};
    result.rows.forEach((click) => {
      if (click.deviceInfo && click.deviceInfo.os) {
        const os = click.deviceInfo.os;
        osCount[os] = (osCount[os] || 0) + 1;
      }
    });

    // Sort and format data for chart
    const sortedEntries = Object.entries(osCount).sort((a, b) => b[1] - a[1]);

    // Get top 7 OS and aggregate the rest as 'Others'
    let topEntries = sortedEntries.slice(0, 7);
    let othersCount = 0;

    if (sortedEntries.length > 7) {
      for (let i = 7; i < sortedEntries.length; i++) {
        othersCount += sortedEntries[i][1];
      }
      topEntries.push(["Others", othersCount]);
    }

    const labels = topEntries.map((entry) => entry[0]);
    const data = topEntries.map((entry) => entry[1]);

    res.json({ labels, data });
  } catch (e) {
    console.error("OS stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/device
app.get("/api/stats/:slug/device", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Count device distribution
    const deviceCount = {};
    result.rows.forEach((click) => {
      if (click.deviceInfo && click.deviceInfo.deviceType) {
        const deviceType = click.deviceInfo.deviceType;
        deviceCount[deviceType] = (deviceCount[deviceType] || 0) + 1;
      }
    });

    // Sort and format data for chart
    const sortedEntries = Object.entries(deviceCount).sort(
      (a, b) => b[1] - a[1],
    );

    // Get top 7 device types and aggregate the rest as 'Others'
    let topEntries = sortedEntries.slice(0, 7);
    let othersCount = 0;

    if (sortedEntries.length > 7) {
      for (let i = 7; i < sortedEntries.length; i++) {
        othersCount += sortedEntries[i][1];
      }
      topEntries.push(["Others", othersCount]);
    }

    const labels = topEntries.map((entry) => entry[0]);
    const data = topEntries.map((entry) => entry[1]);

    res.json({ labels, data });
  } catch (e) {
    console.error("Device stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/referrer
app.get("/api/stats/:slug/referrer", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Count referrer distribution
    const referrerCount = {};
    result.rows.forEach((click) => {
      const referrer = click.referer || "Direct Traffic";

      // Clean and categorize referrers
      let cleanReferrer = "Direct Traffic";
      if (referrer !== "Direct Traffic" && referrer) {
        try {
          const url = new URL(referrer);
          const hostname = url.hostname.replace("www.", "");

          // Categorize common referrers
          if (hostname.includes("google")) cleanReferrer = "Google";
          else if (hostname.includes("bing")) cleanReferrer = "Bing";
          else if (hostname.includes("yahoo")) cleanReferrer = "Yahoo";
          else if (hostname.includes("facebook")) cleanReferrer = "Facebook";
          else if (hostname.includes("twitter") || hostname.includes("x.com"))
            cleanReferrer = "Twitter/X";
          else if (hostname.includes("linkedin")) cleanReferrer = "LinkedIn";
          else if (hostname.includes("reddit")) cleanReferrer = "Reddit";
          else cleanReferrer = hostname;
        } catch (e) {
          cleanReferrer = "Invalid URL";
        }
      }

      referrerCount[cleanReferrer] = (referrerCount[cleanReferrer] || 0) + 1;
    });

    // Sort and format data for chart
    const sortedEntries = Object.entries(referrerCount).sort(
      (a, b) => b[1] - a[1],
    );

    // Get top 5 referrers and aggregate the rest as 'Others'
    let topEntries = sortedEntries.slice(0, 5);
    let othersCount = 0;

    if (sortedEntries.length > 5) {
      for (let i = 5; i < sortedEntries.length; i++) {
        othersCount += sortedEntries[i][1];
      }
      topEntries.push(["Others", othersCount]);
    }

    const labels = topEntries.map((entry) => entry[0]);
    const data = topEntries.map((entry) => entry[1]);

    res.json({ labels, data });
  } catch (e) {
    console.error("Referrer stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/bots
app.get("/api/stats/:slug/bots", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Count bot vs human traffic
    const trafficTypeCount = {
      human: 0,
      bot: 0,
    };

    // Count bot categories
    const botCategoryCount = {};

    // Count specific bots
    const botNameCount = {};

    result.rows.forEach((click) => {
      if (click.isBot) {
        trafficTypeCount.bot++;

        // Count by category
        const category = click.botCategory || "Unknown";
        botCategoryCount[category] = (botCategoryCount[category] || 0) + 1;

        // Count by specific bot name
        const botName = click.botName || "Unknown Bot";
        botNameCount[botName] = (botNameCount[botName] || 0) + 1;
      } else {
        trafficTypeCount.human++;
      }
    });

    // Prepare data for charts
    const trafficTypeData = {
      labels: ["Human Users", "Bots"],
      data: [trafficTypeCount.human, trafficTypeCount.bot],
    };

    // Bot category distribution
    const sortedCategories = Object.entries(botCategoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories

    const categoryData = {
      labels: sortedCategories.map((entry) => entry[0]),
      data: sortedCategories.map((entry) => entry[1]),
    };

    // Specific bot distribution
    const sortedBots = Object.entries(botNameCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7); // Top 7 bots

    const botData = {
      labels: sortedBots.map((entry) => entry[0]),
      data: sortedBots.map((entry) => entry[1]),
    };

    res.json({
      trafficType: trafficTypeData,
      botCategories: categoryData,
      botNames: botData,
      totals: {
        human: trafficTypeCount.human,
        bot: trafficTypeCount.bot,
        total: trafficTypeCount.human + trafficTypeCount.bot,
      },
    });
  } catch (e) {
    console.error("Bot stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/traffic
app.get("/api/stats/:slug/traffic", async (req, res) => {
  try {
    const slug = req.params.slug;
    const period = req.query.period || "7d"; // Default to 7 days

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Process clicks based on period
    const now = new Date();
    let cutoffDate;

    switch (period) {
      case "24h":
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "3d":
        cutoffDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Filter clicks by date and group by hour/day
    const clicksByTime = {};
    result.rows.forEach((click) => {
      if (click.timestamp) {
        const clickTime = new Date(click.timestamp);
        if (clickTime >= cutoffDate) {
          let timeKey;

          if (period === "24h") {
            // Group by hour for 24h view
            timeKey = clickTime.toISOString().slice(0, 13) + ":00:00";
          } else {
            // Group by day for longer periods
            timeKey = clickTime.toISOString().slice(0, 10);
          }

          clicksByTime[timeKey] = (clicksByTime[timeKey] || 0) + 1;
        }
      }
    });

    // Create time series data
    const timeLabels = [];
    const clickCounts = [];

    if (period === "24h") {
      // Last 24 hours - hourly data
      for (let i = 23; i >= 0; i--) {
        const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourKey = hourTime.toISOString().slice(0, 13) + ":00:00";
        timeLabels.push(
          hourTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
        clickCounts.push(clicksByTime[hourKey] || 0);
      }
    } else {
      // Daily data for longer periods
      const days = period === "3d" ? 3 : period === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const dayTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = dayTime.toISOString().slice(0, 10);
        timeLabels.push(dayTime.toLocaleDateString());
        clickCounts.push(clicksByTime[dayKey] || 0);
      }
    }

    res.json({
      period,
      labels: timeLabels,
      data: clickCounts,
      total: clickCounts.reduce((sum, count) => sum + count, 0),
    });
  } catch (e) {
    console.error("Traffic stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/country
app.get("/api/stats/:slug/country", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await db.query(`
      SELECT * FROM clicks WHERE slug = '${slug}'
    `);

    // Count location distribution - prioritize city/country combination if available
    const locationCount = {};
    result.rows.forEach((click) => {
      if (click.country) {
        // Convert country code to full name using a mapping
        const countryName = getCountryName(click.country);
        // Use the location field which includes city/region info if available
        const location = click.location || countryName;
        locationCount[location] = (locationCount[location] || 0) + 1;
      }
    });

    // Sort and format data for chart
    const sortedEntries = Object.entries(locationCount).sort(
      (a, b) => b[1] - a[1],
    );

    // Get top 3 locations and aggregate the rest as 'Others'
    let topEntries = sortedEntries.slice(0, 3);
    let othersCount = 0;

    if (sortedEntries.length > 3) {
      for (let i = 3; i < sortedEntries.length; i++) {
        othersCount += sortedEntries[i][1];
      }
      topEntries.push(["Others", othersCount]);
    }

    const labels = topEntries.map((entry) => entry[0]);
    const data = topEntries.map((entry) => entry[1]);

    res.json({ labels, data });
  } catch (e) {
    console.error("Country stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// Country code to name mapping
const countryCodes = {
  AF: "Afghanistan",
  AX: "Åland Islands",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "Andorra",
  AO: "Angola",
  AI: "Anguilla",
  AQ: "Antarctica",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia",
  BQ: "Bonaire, Sint Eustatius and Saba",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BV: "Bouvet Island",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BN: "Brunei Darussalam",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CX: "Christmas Island",
  CC: "Cocos (Keeling) Islands",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Congo, Democratic Republic of the Congo",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: "Côte d'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CW: "Curaçao",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  ET: "Ethiopia",
  FK: "Falkland Islands (Malvinas)",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GF: "French Guiana",
  PF: "French Polynesia",
  TF: "French Southern Territories",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GP: "Guadeloupe",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HM: "Heard Island and McDonald Islands",
  VA: "Holy See (Vatican City State)",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran, Islamic Republic of Persian Gulf",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "Korea, Democratic People's Republic of Korea",
  KR: "Korea, Republic of South Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Lao People's Democratic Republic",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MK: "Macedonia",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  YT: "Mayotte",
  MX: "Mexico",
  FM: "Micronesia, Federated States of Micronesia",
  MD: "Moldova, Republic of Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nau",
  NP: "Nepal",
  NL: "Netherlands",
  NC: "New Caledonia",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestinian Territory, Occupied",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RE: "Reunion",
  RO: "Romania",
  RU: "Russian Federation",
  RW: "Rwanda",
  BL: "Saint Barthélemy",
  SH: "Saint Helena, Ascension and Tristan da Cunha",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  MF: "Saint Martin (French part)",
  PM: "Saint Pierre and Miquelon",
  VC: "Saint Vincent and the Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SX: "Sint Maarten (Dutch part)",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  GS: "South Georgia and the South Sandwich Islands",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SJ: "Svalbard and Jan Mayen",
  SZ: "Swaziland",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syrian Arab Republic",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania, United Republic of Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks and Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UM: "United States Minor Outlying Islands",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela, Bolivarian Republic of Venezuela",
  VN: "Vietnam",
  VG: "Virgin Islands, British",
  VI: "Virgin Islands, U.S.",
  WF: "Wallis and Futuna",
  EH: "Western Sahara",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

function getCountryName(code) {
  return countryCodes[code] || code;
}

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test Oracle NoSQL connection
    const result = await db.query("SELECT COUNT(*) FROM urls");

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      oracle_nosql: "connected",
      count: result.rows[0]["COUNT(*)"],
      environment: {
        BASE_URL: process.env.BASE_URL || "NOT SET",
        NODE_ENV: process.env.NODE_ENV || "NOT SET",
        PORT: process.env.PORT || "3000",
      },
    });
  } catch (error) {
    // If table doesn't exist yet, consider it healthy since we can connect
    if (
      error.code === "TABLE_NOT_FOUND" ||
      error.message.includes("not found")
    ) {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        oracle_nosql: "connected",
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

// Cache for recent links
let recentLinksCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/recent
app.get("/api/recent", async (req, res) => {
  try {
    console.log("Recent links request received");

    const now = Date.now();

    // Return cached data if still valid
    if (recentLinksCache && now - cacheTimestamp < CACHE_DURATION) {
      console.log("Returning cached recent links");
      return res.json(recentLinksCache);
    }

    try {
      const result = await db.query(`
        SELECT * FROM urls
        ORDER BY createdAt DESC
        LIMIT 20
      `);

      console.log("Found documents:", result.rows.length);

      const list = result.rows.map((data) => {
        console.log("Processing document:", data.slug, data.longUrl);

        return {
          slug: data.slug,
          longUrl: data.longUrl,
          clicks: data.clicks || 0,
          shortUrl: `${process.env.BASE_URL || "https://dailybugle.tech"}/${
            data.slug
          }`,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toISOString()
            : null,
        };
      });

      // Cache the results
      recentLinksCache = list;
      cacheTimestamp = now;

      console.log("Returning", list.length, "recent links (cached)");
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
        recentLinksCache = [];
        cacheTimestamp = now;
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
  } catch (outerError) {
    console.error("Outer error in recent links:", outerError.message);
    res.status(500).json({
      error: "Server error",
      message: outerError.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/stats/:slug
app.get("/api/stats/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    try {
      const urlResult = await db.query(`
        SELECT * FROM urls WHERE slug = '${slug}'
      `);

      if (urlResult.rows.length === 0) {
        return res.status(404).json({ error: "URL not found" });
      }

      const data = urlResult.rows[0];

      const clicksResult = await db.query(`
        SELECT * FROM clicks WHERE slug = '${slug}'
      `);

      const clickDetails = clicksResult.rows
        .map((c) => {
          // Get location information from IP (backward compatibility)
          let location = c.location || "Unknown"; // Use stored location if available
          if (location === "Unknown" && c.ip) {
            const geo = geoip.lookup(c.ip);
            if (geo) {
              const countryName = getCountryName(geo.country);
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
          };
        })
        .sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

      res.json({
        slug,
        longUrl: data.longUrl,
        clicks: data.clicks || 0,
        createdAt: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : null,
        clickDetails,
      });
    } catch (error) {
      console.error("Stats error fetching from Oracle NoSQL:", error);
      res.status(500).json({ error: "Server error" });
    }
  } catch (e) {
    console.error("Stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// 4. Short URL Redirect (/slug)
// ===============================
app.get("/:slug([A-Za-z0-9-_]+)", async (req, res, next) => {
  const slug = req.params.slug;

  const blockedRoutes = ["api", "dashboard", "stats", "analytics", "recent"];
  if (blockedRoutes.includes(slug)) return next();

  try {
    const result = await db.query(`
      SELECT * FROM urls WHERE slug = '${slug}'
    `);

    if (result.rows.length === 0) return next();

    const urlData = result.rows[0];

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
      const countryName = getCountryName(geo.country);
      const region = geo.region || geo.city || "Unknown Region";
      location = `${region}, ${countryName}`;
    }

    // Save analytics
    try {
      await Promise.all([
        // Update URL clicks atomically
        db.query(`
          UPDATE urls 
          SET clicks = clicks + 1,
              lastAccessed = '${new Date().toISOString()}'
          WHERE slug = '${slug}'
        `),

        // Add click record
        db.query(`
          INSERT INTO clicks VALUES (
            '${crypto.randomUUID()}',
            '${slug}',
            '${new Date().toISOString()}',
            '${ip || ""}',
            '${userAgent}',
            '${req.get("Referer") || ""}',
            '${country || ""}',
            '${location}',
            ${botDetection.isBot},
            '${botDetection.category || ""}',
            '${botDetection.name || ""}',
            ${JSON.stringify(deviceInfo)}
          )
        `),
      ]);
    } catch (analyticsError) {
      // If table doesn't exist, log but still redirect
      if (
        analyticsError.code === "TABLE_NOT_FOUND" ||
        analyticsError.message.includes("not found") ||
        analyticsError.message.includes("Missing or invalid table name")
      ) {
        console.warn(
          "Analytics tables not available, continuing redirect:",
          analyticsError.message,
        );
      } else {
        console.error("Error saving analytics:", analyticsError);
      }
    }

    return res.redirect(301, urlData.longUrl);
  } catch (e) {
    console.error("Redirect error:", e);
    res.status(500).send("Server error");
  }
});

// ===============================
// 5. React Fallback
// ===============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
