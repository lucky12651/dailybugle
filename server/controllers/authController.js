const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../postgresql");

const authController = {
  // GET /api/auth/2fa-status - Check if 2FA is enabled and if setup is allowed
  async check2FAStatus(req, res) {
    try {
      const is2FAResult = await db.query(
        "SELECT COUNT(*) as count FROM auth_secrets WHERE is_verified = true",
      );

      const setupAllowedResult = await db.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'allow_2fa_setup'",
      );

      const is2FAEnabled = is2FAResult.rows[0].count > 0;
      const allowSetup = setupAllowedResult.rows.length > 0 ? setupAllowedResult.rows[0].setting_value : true;

      res.json({
        enabled: is2FAEnabled,
        setupAllowed: allowSetup,
      });
    } catch (error) {
      console.error("Check 2FA status error:", error);
      res.status(500).json({ error: "Failed to check 2FA status" });
    }
  },

  // POST /api/auth/setup-2fa - Generate secret and QR code
  async setup2FA(req, res) {
    try {
      // Check if 2FA setup is allowed
      const setupAllowedResult = await db.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'allow_2fa_setup'",
      );

      const allowSetup = setupAllowedResult.rows.length > 0 ? setupAllowedResult.rows[0].setting_value : true;

      if (!allowSetup) {
        return res.status(403).json({ error: "2FA setup is currently disabled by admin" });
      }

      const secret = speakeasy.generateSecret({
        name: "Daily Bugle Admin",
        issuer: "Daily Bugle",
        length: 32,
      });

      // Store unverified secret in database
      await db.query(
        "INSERT INTO auth_secrets (secret, is_verified) VALUES ($1, $2)",
        [secret.base32, false],
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32,
      });
    } catch (error) {
      console.error("Setup 2FA error:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  },

  // POST /api/auth/verify-2fa - Verify 2FA code
  async verify2FA(req, res) {
    try {
      const { token, secret } = req.body;

      if (!token || !secret) {
        return res.status(400).json({ error: "Token and secret required" });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 2, // Allow 2 time windows before and after
      });

      if (!verified) {
        return res.status(401).json({ error: "Invalid 2FA code" });
      }

      // Mark secret as verified
      await db.query(
        "UPDATE auth_secrets SET is_verified = true WHERE secret = $1",
        [secret],
      );

      // Generate JWT token for 24 hours
      const jwtToken = jwt.sign(
        { verified: true },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "24h" },
      );

      res.json({
        token: jwtToken,
        message: "2FA verified successfully",
      });
    } catch (error) {
      console.error("Verify 2FA error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  // POST /api/auth/login - Login with 2FA code only
  async login(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "6-digit code required" });
      }

      // Get all verified secrets
      const result = await db.query(
        "SELECT secret FROM auth_secrets WHERE is_verified = true ORDER BY created_at DESC",
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "2FA not configured" });
      }

      // Try each secret to find a match
      let verified = false;
      for (const row of result.rows) {
        const secret = row.secret;
        
        const isValid = speakeasy.totp.verify({
          secret: secret,
          encoding: "base32",
          token: token,
          window: 2, // Allow 2 time windows before and after
        });

        if (isValid) {
          verified = true;
          break;
        }
      }

      if (!verified) {
        console.log(`Failed 2FA login attempt with invalid code`);
        return res.status(401).json({ error: "Invalid 6-digit code" });
      }

      // Generate JWT token for 24 hours
      const jwtToken = jwt.sign(
        { authenticated: true, timestamp: Date.now() },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "24h" },
      );

      res.json({
        token: jwtToken,
        message: "Logged in successfully",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = authController;
