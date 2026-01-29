const ClickModel = require("../models/Click");

class StatsService {
  static async getOsStats(slug) {
    try {
      return await ClickModel.getOsStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getDeviceStats(slug) {
    try {
      return await ClickModel.getDeviceStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getReferrerStats(slug) {
    try {
      return await ClickModel.getReferrerStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getBotStats(slug) {
    try {
      return await ClickModel.getBotStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getTrafficStats(slug, period = "7d") {
    try {
      return await ClickModel.getTrafficStats(slug, period);
    } catch (error) {
      throw error;
    }
  }

  static async getCountryStats(slug) {
    try {
      return await ClickModel.getCountryStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getUserStats(slug) {
    try {
      return await ClickModel.getUserStats(slug);
    } catch (error) {
      throw error;
    }
  }

  static async getUserTrafficStats(slug, userId, period = "30d") {
    try {
      return await ClickModel.getUserTrafficStats(slug, userId, period);
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      return await ClickModel.findAllUsers();
    } catch (error) {
      throw error;
    }
  }

  static async getGlobalUserTraffic(userId, period) {
    try {
      return await ClickModel.getGlobalUserTraffic(userId, period);
    } catch (error) {
      throw error;
    }
  }

  static async getUserLinks(userId, limit, offset) {
    try {
      return await ClickModel.getUserLinks(userId, limit, offset);
    } catch (error) {
      throw error;
    }
  }

  static async getAllStats(slug) {
    try {
      const [
        osStats,
        deviceStats,
        referrerStats,
        botStats,
        trafficStats,
        countryStats,
        userStats,
      ] = await Promise.all([
        this.getOsStats(slug),
        this.getDeviceStats(slug),
        this.getReferrerStats(slug),
        this.getBotStats(slug),
        this.getTrafficStats(slug),
        this.getCountryStats(slug),
        this.getUserStats(slug),
      ]);

      return {
        os: osStats,
        device: deviceStats,
        referrer: referrerStats,
        bots: botStats,
        traffic: trafficStats,
        country: countryStats,
        users: userStats,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StatsService;
