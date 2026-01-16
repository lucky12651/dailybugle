const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();
const cors = require("cors");
const geoip = require("geoip-lite");
const path = require("path");

// Firebase Setup
const serviceAccount = require("./firebaseServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

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
    const { longUrl, customSlug } = req.body;

    if (!longUrl) return res.status(400).json({ error: "Long URL required" });

    try {
      new URL(longUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let slug = customSlug || generateRandomSlug();

    if (customSlug) {
      const exists = await db.collection("urls").doc(slug).get();
      if (exists.exists)
        return res.status(409).json({ error: "Custom slug already exists" });
    }

    await db.collection("urls").doc(slug).set({
      slug,
      longUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      clicks: 0,
    });

    const shortUrl = `${
      process.env.BASE_URL || "https://dailybugle.tech"
    }/${slug}`;
    res.json({ slug, longUrl, shortUrl });
  } catch (e) {
    console.error("Shorten error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug/os
app.get("/api/stats/:slug/os", async (req, res) => {
  try {
    const slug = req.params.slug;

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    // Count OS distribution
    const osCount = {};
    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();
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

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    // Count device distribution
    const deviceCount = {};
    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();
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

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    // Count referrer distribution
    const referrerCount = {};
    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();
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

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    // Count bot vs human traffic
    const trafficTypeCount = {
      human: 0,
      bot: 0,
    };

    // Count bot categories
    const botCategoryCount = {};

    // Count specific bots
    const botNameCount = {};

    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();

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

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

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
    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();
      if (click.timestamp) {
        const clickTime = click.timestamp.toDate();
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

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    // Count location distribution - prioritize city/country combination if available
    const locationCount = {};
    clicksSnapshot.docs.forEach((doc) => {
      const click = doc.data();
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

// GET /api/recent
app.get("/api/recent", async (req, res) => {
  try {
    const snap = await db
      .collection("urls")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const list = snap.docs.map((d) => ({
      slug: d.id,
      longUrl: d.data().longUrl,
      clicks: d.data().clicks || 0,
      shortUrl: `${process.env.BASE_URL || "https://dailybugle.tech"}/${d.id}`,
      createdAt: d.data().createdAt
        ? d.data().createdAt.toDate().toISOString()
        : null,
    }));

    res.json(list);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stats/:slug
app.get("/api/stats/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const doc = await db.collection("urls").doc(slug).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "URL not found" });
    }

    const data = doc.data();

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    const clickDetails = clicksSnapshot.docs
      .map((d) => {
        const c = d.data();

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
          id: d.id,
          timestamp: c.timestamp ? c.timestamp.toDate().toISOString() : null,
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
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Safe sort

    res.json({
      slug,
      longUrl: data.longUrl,
      clicks: data.clicks || 0,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      clickDetails,
    });
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

  const reactRoutes = ["stats", "dashboard", "analytics"];
  if (reactRoutes.includes(slug)) return next();

  try {
    const doc = await db.collection("urls").doc(slug).get();
    if (!doc.exists) return next();

    const urlData = doc.data();

    const userAgent = req.get("User-Agent") || "";
    const ip =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      null;

    const deviceInfo = parseDeviceInfoFromUA(userAgent);
    const botDetection = detectBot(userAgent);
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;

    // Compute human-readable location
    let location = "Unknown";
    if (geo) {
      const countryName = getCountryName(geo.country);
      const region = geo.region || geo.city || "Unknown Region";
      location = `${region}, ${countryName}`;
    }

    // Save analytics
    await Promise.all([
      db
        .collection("urls")
        .doc(slug)
        .update({
          clicks: admin.firestore.FieldValue.increment(1),
          lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
        }),

      db.collection("clicks").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        slug,
        ip,
        userAgent,
        referer: req.get("Referer") || null,
        country,
        location, // Store human-readable location
        isBot: botDetection.isBot,
        botCategory: botDetection.category || null,
        botName: botDetection.name || null,
        deviceInfo, // ← REQUIRED BY FRONTEND
      }),
    ]);

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
