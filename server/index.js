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
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Bot detection
function isBot(ua = "") {
  const bots = [
    /redditbot/i, 
    /bot/i,
    /crawl/i,
    /spider/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /discordbot/i,
    /bingbot/i,
    /googlebot/i,
    /yandex/i,
    /pinterest/i,
  ];
  return bots.some((b) => b.test(ua));
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

    const shortUrl = `${process.env.BASE_URL || "https://dailybugle.tech"}/${slug}`;
    res.json({ slug, longUrl, shortUrl });
  } catch (e) {
    console.error("Shorten error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

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
        return {
          id: d.id,
          timestamp: c.timestamp ? c.timestamp.toDate().toISOString() : null,
          ip: c.ip || null,
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
      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null,
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
    const bot = isBot(userAgent);
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;

    // Save analytics
    await Promise.all([
      db.collection("urls")
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
        isBot: bot,
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
