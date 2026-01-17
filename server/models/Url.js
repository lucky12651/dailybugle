const db = require("../oracleNosql");

class UrlModel {
  static async create({ slug, longUrl }) {
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

      return { slug, longUrl, clicks: 0, createdAt: now, updatedAt: now };
    } catch (error) {
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      const result = await db.query(`
        SELECT * FROM urls WHERE slug = '${slug}'
      `);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const {
        limit = 20,
        orderBy = "createdAt",
        orderDirection = "DESC",
      } = options;

      const result = await db.query(`
        SELECT * FROM urls
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT ${limit}
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async incrementClicks(slug) {
    try {
      const now = new Date().toISOString();
      await db.query(`
        UPDATE urls 
        SET clicks = clicks + 1,
            lastAccessed = '${now}'
        WHERE slug = '${slug}'
      `);
    } catch (error) {
      throw error;
    }
  }

  static async exists(slug) {
    try {
      const result = await db.query(`
        SELECT 1 FROM urls WHERE slug = '${slug}'
      `);

      return result.rows.length > 0;
    } catch (error) {
      // If table doesn't exist, assume URL doesn't exist
      if (
        error.code === "TABLE_NOT_FOUND" ||
        error.message.includes("not found")
      ) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = UrlModel;
