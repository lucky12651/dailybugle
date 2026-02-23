require("dotenv").config();
const db = require("./postgresql");

async function addIndexes() {
  try {
    console.log("Adding indexes...");

    // Index for finding clicks by slug (already covered by foreign key? No, FK doesn't imply index in PG)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_clicks_slug ON clicks(slug);`,
    );

    // Index for filtering by timestamp (for time-based queries)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON clicks(timestamp);`,
    );

    // Composite index for slug + timestamp (very common query pattern: WHERE slug=$1 AND timestamp > $2)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_clicks_slug_timestamp ON clicks(slug, timestamp DESC);`,
    );

    // Index for user_id (for filtering by user)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_clicks_user_id ON clicks(user_id);`,
    );

    // Composite index for user_id + timestamp
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_clicks_user_id_timestamp ON clicks(user_id, timestamp DESC);`,
    );

    console.log("Indexes added successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add indexes:", error.message);
    process.exit(1);
  }
}

addIndexes();
