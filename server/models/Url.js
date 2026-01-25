const db = require("../postgresql");

class UrlModel {
  static _mapRow(row) {
    if (!row) return null;
    return {
      slug: row.slug || row.short_code,
      longUrl: row.long_url,
      clicks: row.clicks,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      lastAccessed: row.last_accessed
        ? new Date(row.last_accessed).toISOString()
        : null,
    };
  }

  static async create({ slug, longUrl }) {
    try {
      const now = new Date().toISOString();
      try {
        await db.query(
          `INSERT INTO urls (slug, short_code, long_url, clicks, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [slug, slug, longUrl, 0, now, now],
        );
      } catch (err) {
        if (err.code === "42703" || (err.message || "").includes("column")) {
          await db.query(
            `INSERT INTO urls (slug, long_url, clicks, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
            [slug, longUrl, 0, now, now],
          );
        } else {
          throw err;
        }
      }

      return { slug, longUrl, clicks: 0, createdAt: now, updatedAt: now };
    } catch (error) {
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      let result;
      try {
        result = await db.query(
          `SELECT * FROM urls WHERE slug = $1 OR short_code = $1 LIMIT 1`,
          [slug],
        );
      } catch (err) {
        if (err.code === "42703" || (err.message || "").includes("column")) {
          result = await db.query(`SELECT * FROM urls WHERE slug = $1`, [slug]);
        } else {
          throw err;
        }
      }
      return UrlModel._mapRow(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        orderBy = "createdAt",
        orderDirection = "DESC",
      } = options;

      // Sanitize order values to prevent SQL injection
      const allowedOrder = {
        createdAt: "created_at",
        updatedAt: "updated_at",
        clicks: "clicks",
        slug: "slug",
      };
      const order = allowedOrder[orderBy] || "created_at";
      const dir = orderDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const result = await db.query(
        `SELECT * FROM urls ORDER BY ${order} ${dir} LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      return result.rows.map(UrlModel._mapRow);
    } catch (error) {
      throw error;
    }
  }

  static async incrementClicks(slug) {
    try {
      const now = new Date().toISOString();
      const res = await db.query(
        `UPDATE urls SET clicks = clicks + 1, last_accessed = $2 WHERE slug = $1`,
        [slug, now],
      );
      if (res.rowCount === 0) {
        try {
          await db.query(
            `UPDATE urls SET clicks = clicks + 1, last_accessed = $2 WHERE short_code = $1`,
            [slug, now],
          );
        } catch (err) {
          if (
            !(err.code === "42703" || (err.message || "").includes("column"))
          ) {
            throw err;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async exists(slug) {
    try {
      let result;
      try {
        result = await db.query(
          `SELECT 1 FROM urls WHERE slug = $1 OR short_code = $1`,
          [slug],
        );
      } catch (err) {
        if (err.code === "42703" || (err.message || "").includes("column")) {
          result = await db.query(`SELECT 1 FROM urls WHERE slug = $1`, [slug]);
        } else {
          throw err;
        }
      }
      return result.rows.length > 0;
    } catch (error) {
      // Postgres undefined_table error code is 42P01
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = UrlModel;
