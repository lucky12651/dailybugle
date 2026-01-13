const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();
const cors = require("cors");
const geoip = require("geoip-lite");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    process.env.FIRESTORE_DATABASE_URL ||
    "https://your-project-id.firebaseio.com",
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Helper function to generate random slug
function generateRandomSlug(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/shorten - Create short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { longUrl, customSlug } = req.body;

    // Validate input
    if (!longUrl) {
      return res.status(400).json({ error: "Long URL is required" });
    }

    // Validate URL format
    try {
      new URL(longUrl);
    } catch (err) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    let slug;
    if (customSlug) {
      // Check if custom slug already exists
      const doc = await db.collection("urls").doc(customSlug).get();
      if (doc.exists) {
        return res.status(409).json({ error: "Custom slug already exists" });
      }
      slug = customSlug;
    } else {
      // Generate random slug
      let attempts = 0;
      do {
        slug = generateRandomSlug();
        const doc = await db.collection("urls").doc(slug).get();
        if (!doc.exists) break;
        attempts++;
      } while (attempts < 10); // Prevent infinite loop

      if (attempts >= 10) {
        return res
          .status(500)
          .json({ error: "Failed to generate unique slug" });
      }
    }

    // Create document in Firestore
    const urlData = {
      longUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      clicks: 0,
      slug,
    };

    await db.collection("urls").doc(slug).set(urlData);

    const shortUrl = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/${slug}`;

    res.json({
      shortUrl,
      slug,
      longUrl,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to detect if the request is from a bot
function isBot(userAgent) {
  const botPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /redditbot/i,
    /linkedinbot/i,
    /slackbot/i,
    /whatsapp/i,
    /pinterest/i,
    /telegrambot/i,
    /skypeuripreview/i,
    /discordbot/i,
    /tumblr/i,
    /bingbot/i,
    /yandex/i,
    /google/i,
    /yahoo/i,
    /seznambot/i,
    /ltx71/i,
    /mj12bot/i,
    /ahrefsbot/i,
    /semrushbot/i,
    /exabot/i,
    /ia_archiver/i,
    /mediapartners/i,
    /adsbot/i,
    /apis-google/i,
    /smtbot/i,
    /rogerbot/i,
    /adidxbot/i,
    /mj12bot/i,
    /dotbot/i,
    /gigabot/i,
    /ia_archiver/i,
    /surveybot/i,
    /voilabot/i,
    /archive.org_bot/i,
    /netseer/i,
    /gssbot/i,
    /appengine-google/i,
    /google-structured-data-testing-tool/i,
    /chrome-lighthouse/i,
    /google-inspection-tool/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

// GET /:slug - Redirect to long URL
app.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const userAgent = req.get("User-Agent") || "";
    const ip =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Look up the slug in Firestore
    const doc = await db.collection("urls").doc(slug).get();

    if (!doc.exists) {
      return res.status(404).send(`
        <html>
          <head><title>URL Not Found</title></head>
          <body>
            <h1>Short URL Not Found</h1>
            <p>The requested short URL does not exist.</p>
            <a href="/">Go Home</a>
          </body>
        </html>
      `);
    }

    const urlData = doc.data();

    // Check if the request is from a bot
    const botDetected = isBot(userAgent);

    // Increment clicks counter and add analytics
    await db
      .collection("urls")
      .doc(slug)
      .update({
        clicks: admin.firestore.FieldValue.increment(1),
        lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Lookup country from IP address
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;

    // Add click analytics to a separate collection
    const clickData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: userAgent,
      ip: ip,
      referer: req.get("Referer") || null,
      slug: slug,
      country: country,
      isBot: botDetected,
    };

    // Add to click analytics collection
    await db.collection("clicks").add(clickData);

    // If bot is detected, redirect to Google; otherwise redirect to the original URL
    if (botDetected) {
      res.redirect(301, "https://www.google.com");
    } else {
      res.redirect(301, urlData.longUrl);
    }
  } catch (error) {
    console.error("Error during redirect:", error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>An error occurred while processing your request.</p>
          <a href="/">Go Home</a>
        </body>
      </html>
    `);
  }
});

// GET /api/recent - Get recent URLs for a user (basic implementation without user auth)
app.get("/api/recent", async (req, res) => {
  try {
    const snapshot = await db
      .collection("urls")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const urls = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      urls.push({
        slug: doc.id,
        longUrl: data.longUrl,
        shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${
          doc.id
        }`,
        clicks: data.clicks || 0,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
      });
    });

    res.json(urls);
  } catch (error) {
    console.error("Error fetching recent URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/:slug - Get stats for a specific short URL
app.get("/api/stats/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const doc = await db.collection("urls").doc(slug).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "URL not found" });
    }

    const data = doc.data();

    // Get click analytics for this slug
    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    const clicks = [];
    clicksSnapshot.forEach((clickDoc) => {
      const clickData = clickDoc.data();
      clicks.push({
        id: clickDoc.id,
        timestamp: clickData.timestamp
          ? clickData.timestamp.toDate().toISOString()
          : null,
        userAgent: clickData.userAgent,
        ip: clickData.ip,
        referer: clickData.referer,
        isBot: clickData.isBot || false,
        // Parse device info from user agent
        deviceInfo: parseDeviceInfoFromUA(clickData.userAgent),
      });
    });

    // Sort clicks by timestamp in descending order (most recent first) and limit to 100
    clicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedClicks = clicks.slice(0, 100);

    res.json({
      slug,
      longUrl: data.longUrl,
      clicks: data.clicks || 0,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      lastAccessed: data.lastAccessed
        ? data.lastAccessed.toDate().toISOString()
        : null,
      clickDetails: limitedClicks,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to parse device info from user agent
function parseDeviceInfoFromUA(userAgent) {
  // Device type detection
  const isMobile = /mobile|android|iphone|ipod|ipad/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent) && !isMobile;

  // OS detection
  let os = "Unknown";
  if (/windows nt 10/i.test(userAgent)) os = "Windows 10/11";
  else if (/windows nt 6\.3/i.test(userAgent)) os = "Windows 8.1";
  else if (/windows nt 6\.2/i.test(userAgent)) os = "Windows 8";
  else if (/windows nt 6\.1/i.test(userAgent)) os = "Windows 7";
  else if (/mac os x/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/linux/i.test(userAgent)) os = "Linux";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

  // Browser detection
  let browser = "Unknown";
  if (/chrome|chromium|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
    browser = "Safari";
  else if (/edge/i.test(userAgent)) browser = "Edge";
  else if (/opera|opr/i.test(userAgent)) browser = "Opera";

  return {
    deviceType: isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop",
    os,
    browser,
  };
}

// GET /api/stats/:slug/os - Get OS distribution for a specific slug
app.get("/api/stats/:slug/os", async (req, res) => {
  try {
    const { slug } = req.params;

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    const osCount = {};

    clicksSnapshot.forEach((clickDoc) => {
      const clickData = clickDoc.data();
      // Only count non-bot visits for analytics
      if (!clickData.isBot) {
        const deviceInfo = parseDeviceInfoFromUA(clickData.userAgent);
        const os = deviceInfo.os;

        if (osCount[os]) {
          osCount[os]++;
        } else {
          osCount[os] = 1;
        }
      }
    });

    // Convert to chart format
    const labels = Object.keys(osCount);
    const data = Object.values(osCount);

    res.json({
      labels,
      data,
      total: labels.reduce((sum, _, i) => sum + data[i], 0),
    });
  } catch (error) {
    console.error("Error fetching OS stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/:slug/country - Get country distribution for a specific slug
app.get("/api/stats/:slug/country", async (req, res) => {
  try {
    const { slug } = req.params;

    const clicksSnapshot = await db
      .collection("clicks")
      .where("slug", "==", slug)
      .get();

    const countryCount = {};

    clicksSnapshot.forEach((clickDoc) => {
      const clickData = clickDoc.data();
      // Only count non-bot visits for analytics
      if (!clickData.isBot) {
        const country = clickData.country;

        if (country) {
          // Only count if country is available
          if (countryCount[country]) {
            countryCount[country]++;
          } else {
            countryCount[country] = 1;
          }
        }
      }
    });

    // Convert to chart format
    const labels = Object.keys(countryCount);
    const data = Object.values(countryCount);

    res.json({
      labels,
      data,
      total: labels.reduce((sum, _, i) => sum + data[i], 0),
    });
  } catch (error) {
    console.error("Error fetching country stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Root route for health check and home page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>URL Shortener</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 600px; margin: 0 auto; }
          input, button { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; }
          button { background-color: #007bff; color: white; border: none; cursor: pointer; }
          button:hover { background-color: #0056b3; }
          .result { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; }
          .error { color: red; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>URL Shortener</h1>
          <form id="shortenForm">
            <input type="url" id="longUrl" placeholder="Enter long URL" required />
            <input type="text" id="customSlug" placeholder="Custom slug (optional)" />
            <button type="submit">Shorten URL</button>
          </form>
          <div id="result"></div>
        </div>
        
        <script>
          document.getElementById('shortenForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const longUrl = document.getElementById('longUrl').value;
            const customSlug = document.getElementById('customSlug').value;
            
            try {
              const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ longUrl, customSlug })
              });
              
              const data = await response.json();
              
              const resultDiv = document.getElementById('result');
              if (response.ok) {
                resultDiv.innerHTML = '<div class="result success"><strong>Shortened URL:</strong> <a href="' + data.shortUrl + '" target="_blank">' + data.shortUrl + '</a><br><button onclick="copyToClipboard(\'' + data.shortUrl + '\')">Copy to Clipboard</button></div>';
              } else {
                resultDiv.innerHTML = '<div class="result error">Error: ' + data.error + '</div>';
              }
            } catch (error) {
              document.getElementById('result').innerHTML = '<div class="result error">Network error: ' + error.message + '</div>';
            }
          });
          
          async function copyToClipboard(text) {
            try {
              await navigator.clipboard.writeText(text);
              alert('Copied to clipboard!');
            } catch (err) {
              console.error('Failed to copy: ', err);
            }
          }
        </script>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
