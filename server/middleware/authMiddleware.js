const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.replace(/^Bearer\s+/i, "");

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_key",
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired." });
    }
    console.error("JWT Verification Error:", error.message);
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
