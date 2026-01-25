require('dotenv').config();
const db = require('./postgresql');

async function init() {
  try {
    console.log('Connecting to Postgres...');

    // Create settings table for 2FA setup toggle
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert default 2FA setup setting if not exists
    await db.query(`
      INSERT INTO settings (setting_key, setting_value)
      VALUES ('allow_2fa_setup', true)
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    // Create auth_secrets table for storing 2FA secrets
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_secrets (
        id SERIAL PRIMARY KEY,
        secret TEXT NOT NULL UNIQUE,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

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
        device_info JSONB,
        user_id TEXT
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