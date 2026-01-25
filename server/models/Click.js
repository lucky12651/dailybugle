const db = require("../postgresql");
const crypto = require("crypto");

class ClickModel {
  static _mapRow(row) {
    return {
      id: row.id,
      slug: row.slug,
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
      ip: row.ip,
      userAgent: row.user_agent,
      referer: row.referer,
      country: row.country,
      location: row.location,
      isBot: row.is_bot,
      botCategory: row.bot_category,
      botName: row.bot_name,
      deviceInfo: row.device_info,
      userId: row.user_id,
    };
  }

  static async create(clickData) {
    try {
      const {
        slug,
        ip,
        userAgent,
        referer,
        country,
        location,
        isBot,
        botCategory,
        botName,
        deviceInfo,
        userId,
      } = clickData;

      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      try {
        await db.query(
          `INSERT INTO clicks (id, slug, timestamp, ip, user_agent, referer, country, location, is_bot, bot_category, bot_name, device_info, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            id,
            slug,
            timestamp,
            ip || null,
            userAgent || null,
            referer || null,
            country || null,
            location || null,
            !!isBot,
            botCategory || null,
            botName || null,
            deviceInfo || {},
            userId || null,
          ],
        );
      } catch (err) {
        // Fallback for missing user_id column
        if (err.code === "42703" || (err.message || "").includes("column")) {
          await db.query(
            `INSERT INTO clicks (id, slug, timestamp, ip, user_agent, referer, country, location, is_bot, bot_category, bot_name, device_info) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [
              id,
              slug,
              timestamp,
              ip || null,
              userAgent || null,
              referer || null,
              country || null,
              location || null,
              !!isBot,
              botCategory || null,
              botName || null,
              deviceInfo || {},
            ],
          );
        } else {
          throw err;
        }
      }

      return {
        id,
        slug,
        timestamp,
        ip,
        userAgent,
        referer,
        country,
        location,
        isBot: !!isBot,
        botCategory,
        botName,
        deviceInfo,
        userId,
      };
    } catch (error) {
      throw error;
    }
  }

  static async findAllBySlug(slug) {
    try {
      const result = await db.query(`SELECT * FROM clicks WHERE slug = $1`, [
        slug,
      ]);
      return result.rows.map(ClickModel._mapRow);
    } catch (error) {
      throw error;
    }
  }

  static async findBySlug(slug, limit = null, offset = 0) {
    try {
      let query = `SELECT * FROM clicks WHERE slug = $1 ORDER BY timestamp DESC`;
      const params = [slug];

      if (limit) {
        query += ` LIMIT $2 OFFSET $3`;
        params.push(limit, offset);
      }

      const result = await db.query(query, params);
      return result.rows.map(ClickModel._mapRow);
    } catch (error) {
      throw error;
    }
  }

  static async getStatsBySlug(slug) {
    return this.findBySlug(slug);
  }

  static async getOsStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const osCount = {};
      clicks.forEach((click) => {
        if (click.deviceInfo && click.deviceInfo.os) {
          const os = click.deviceInfo.os;
          osCount[os] = (osCount[os] || 0) + 1;
        }
      });

      const sortedEntries = Object.entries(osCount).sort((a, b) => b[1] - a[1]);

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

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getDeviceStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const deviceCount = {};
      clicks.forEach((click) => {
        if (click.deviceInfo && click.deviceInfo.deviceType) {
          const deviceType = click.deviceInfo.deviceType;
          deviceCount[deviceType] = (deviceCount[deviceType] || 0) + 1;
        }
      });

      const sortedEntries = Object.entries(deviceCount).sort(
        (a, b) => b[1] - a[1],
      );

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

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getReferrerStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const referrerCount = {};
      clicks.forEach((click) => {
        const referrer = click.referer || "Direct Traffic";

        let cleanReferrer = "Direct Traffic";
        if (referrer !== "Direct Traffic" && referrer) {
          try {
            const url = new URL(referrer);
            const hostname = url.hostname.replace("www.", "");

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

      const sortedEntries = Object.entries(referrerCount).sort(
        (a, b) => b[1] - a[1],
      );

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

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getBotStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const trafficTypeCount = { human: 0, bot: 0 };
      const botCategoryCount = {};
      const botNameCount = {};

      clicks.forEach((click) => {
        if (click.isBot) {
          trafficTypeCount.bot++;

          const category = click.botCategory || "Unknown";
          botCategoryCount[category] = (botCategoryCount[category] || 0) + 1;

          const botName = click.botName || "Unknown Bot";
          botNameCount[botName] = (botNameCount[botName] || 0) + 1;
        } else {
          trafficTypeCount.human++;
        }
      });

      const trafficTypeData = {
        labels: ["Human Users", "Bots"],
        data: [trafficTypeCount.human, trafficTypeCount.bot],
      };

      const sortedCategories = Object.entries(botCategoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const categoryData = {
        labels: sortedCategories.map((entry) => entry[0]),
        data: sortedCategories.map((entry) => entry[1]),
      };

      const sortedBots = Object.entries(botNameCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

      const botData = {
        labels: sortedBots.map((entry) => entry[0]),
        data: sortedBots.map((entry) => entry[1]),
      };

      return {
        trafficType: trafficTypeData,
        botCategories: categoryData,
        botNames: botData,
        totals: {
          human: trafficTypeCount.human,
          bot: trafficTypeCount.bot,
          total: trafficTypeCount.human + trafficTypeCount.bot,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTrafficStats(slug, period = "7d") {
    try {
      const clicks = await this.findAllBySlug(slug);

      const now = new Date();
      const locale = "en-IN";
      const timeZone = "Asia/Kolkata";
      const hourFormatter = new Intl.DateTimeFormat(locale, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
      });
      const dayFormatter = new Intl.DateTimeFormat(locale, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const hourKeyFromDate = (d) => {
        const parts = Object.fromEntries(
          hourFormatter.formatToParts(d).map((p) => [p.type, p.value]),
        );
        return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:00:00`;
      };
      const dayKeyFromDate = (d) => {
        const parts = Object.fromEntries(
          dayFormatter.formatToParts(d).map((p) => [p.type, p.value]),
        );
        return `${parts.year}-${parts.month}-${parts.day}`;
      };
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
        case "45d":
          cutoffDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const clicksByTime = {};
      clicks.forEach((click) => {
        if (click.timestamp) {
          const clickTime = new Date(click.timestamp);
          if (clickTime >= cutoffDate) {
            let timeKey;

            if (period === "24h") {
              timeKey = hourKeyFromDate(clickTime);
            } else {
              timeKey = dayKeyFromDate(clickTime);
            }

            clicksByTime[timeKey] = (clicksByTime[timeKey] || 0) + 1;
          }
        }
      });

      const timeLabels = [];
      const clickCounts = [];

      if (period === "24h") {
        for (let i = 23; i >= 0; i--) {
          const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourKey = hourKeyFromDate(hourTime);
          timeLabels.push(
            hourTime.toLocaleTimeString("en-IN", {
              timeZone,
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          );
          clickCounts.push(clicksByTime[hourKey] || 0);
        }
      } else {
        const days =
          period === "3d"
            ? 3
            : period === "7d"
              ? 7
              : period === "45d"
                ? 45
                : 30;
        for (let i = days - 1; i >= 0; i--) {
          const dayTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayKey = dayKeyFromDate(dayTime);
          timeLabels.push(
            dayTime.toLocaleDateString("en-IN", {
              timeZone,
              day: "2-digit",
              month: "short",
            }),
          );
          clickCounts.push(clicksByTime[dayKey] || 0);
        }
      }

      return {
        period,
        labels: timeLabels,
        data: clickCounts,
        total: clickCounts.reduce((sum, count) => sum + count, 0),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getCountryStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const countryCount = {};
      clicks.forEach((click) => {
        if (click.country) {
          const country = click.country;
          countryCount[country] = (countryCount[country] || 0) + 1;
        }
      });

      const sortedEntries = Object.entries(countryCount).sort(
        (a, b) => b[1] - a[1],
      );

      let topEntries = sortedEntries.slice(0, 7);
      let othersCount = 0;

      if (sortedEntries.length > 7) {
        for (let i = 7; i < sortedEntries.length; i++) {
          othersCount += sortedEntries[i][1];
        }
        topEntries.push(["Others", othersCount]);
      }

      const labels = topEntries.map((entry) =>
        ClickModel.getCountryName(entry[0]),
      );
      const data = topEntries.map((entry) => entry[1]);

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getUserTrafficStats(slug, userId, period = "30d") {
    try {
      const clicks = await this.findAllBySlug(slug);
      const userClicks = clicks.filter((click) => click.userId === userId);

      const now = new Date();
      const locale = "en-US";
      const timeZone = "Asia/Kolkata";
      const dayFormatter = new Intl.DateTimeFormat(locale, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const dayKeyFromDate = (d) => {
        const parts = Object.fromEntries(
          dayFormatter.formatToParts(d).map((p) => [p.type, p.value]),
        );
        return `${parts.year}-${parts.month}-${parts.day}`;
      };

      const days = 30;
      // Start of day 30 days ago
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);

      const clicksByTime = {};
      userClicks.forEach((click) => {
        if (click.timestamp) {
          const clickTime = new Date(click.timestamp);
          if (clickTime >= cutoffDate) {
            const timeKey = dayKeyFromDate(clickTime);
            clicksByTime[timeKey] = (clicksByTime[timeKey] || 0) + 1;
          }
        }
      });

      const timeLabels = [];
      const clickCounts = [];

      for (let i = days - 1; i >= 0; i--) {
        const dayTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = dayKeyFromDate(dayTime);
        timeLabels.push(
          dayTime.toLocaleDateString("en-IN", {
            timeZone,
            day: "2-digit",
            month: "short",
          }),
        );
        clickCounts.push(clicksByTime[dayKey] || 0);
      }

      return {
        period,
        labels: timeLabels,
        data: clickCounts,
        total: clickCounts.reduce((sum, count) => sum + count, 0),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserStats(slug) {
    try {
      const clicks = await this.findAllBySlug(slug);

      const userStats = {};
      clicks.forEach((click) => {
        if (click.userId) {
          const uid = click.userId;
          if (!userStats[uid]) {
            userStats[uid] = { count: 0, lastFetched: click.timestamp };
          }
          userStats[uid].count++;
          // Update lastFetched if this click is more recent
          if (
            click.timestamp &&
            new Date(click.timestamp) > new Date(userStats[uid].lastFetched)
          ) {
            userStats[uid].lastFetched = click.timestamp;
          }
        }
      });

      const sortedEntries = Object.entries(userStats).sort(
        (a, b) => b[1].count - a[1].count,
      );

      // Top 10 users for chart
      let topEntries = sortedEntries.slice(0, 10);

      const labels = topEntries.map((entry) => entry[0]);
      const data = topEntries.map((entry) => entry[1].count);

      // Full list for table
      const userDetails = sortedEntries.map(([uid, stats]) => ({
        userId: uid,
        views: stats.count,
        lastFetched: stats.lastFetched,
      }));

      return { labels, data, userDetails };
    } catch (error) {
      throw error;
    }
  }

  static getCountryName(code) {
    return code || "Unknown";
  }
}

module.exports = ClickModel;
