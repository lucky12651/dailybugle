// Random slug generation
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

module.exports = {
  generateRandomSlug,
  detectBot,
  parseDeviceInfoFromUA,
};
