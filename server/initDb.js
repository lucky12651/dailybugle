require('dotenv').config();
const db = require('./oracleNosql');

async function init() {
  try {
    console.log('Connecting to Postgres...');

    // Create urls table
    await db.query(`
      CREATE TABLE IF NOT EXISTS urls (
        slug TEXT PRIMARY KEY,
        long_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        last_accessed TIMESTAMPTZ
      );
    `);

    // Create clicks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id UUID PRIMARY KEY,
        slug TEXT REFERENCES urls(slug) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ,
        ip TEXT,
        user_agent TEXT,
        referer TEXT,
        country TEXT,
        location TEXT,
        is_bot BOOLEAN DEFAULT false,
        bot_category TEXT,
        bot_name TEXT,
        device_info JSONB
      );
    `);

    console.log('Tables created or already exist.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

init();