const jwt = require("jsonwebtoken");

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const adminEmail = process.env.ADMIN_EMAIL || "team@coffeenblog.com";
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        console.error(
          "CRITICAL: ADMIN_PASSWORD is not set in environment variables!",
        );
        return res.status(500).json({ error: "Server configuration error" });
      }

      if (email !== adminEmail || password !== adminPassword) {
        console.log(`Failed login attempt for ${email}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate token
      const token = jwt.sign(
        { email: adminEmail },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "24h" },
      );

      res.json({
        token,
        user: {
          email: adminEmail,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = authController;
