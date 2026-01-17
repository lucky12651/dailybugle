#!/usr/bin/env node

// Diagnostic script for production environment
const fs = require("fs");
const path = require("path");

console.log("=== PRODUCTION ENVIRONMENT DIAGNOSTIC ===\n");

// Check environment variables
console.log("1. Environment Variables Check:");
console.log("   BASE_URL:", process.env.BASE_URL || "NOT SET");
console.log("   PORT:", process.env.PORT || "NOT SET (default: 3000)");
console.log("   NODE_ENV:", process.env.NODE_ENV || "NOT SET");
console.log("   OCI_REGION:", process.env.OCI_REGION || "NOT SET");
console.log(
  "   OCI_TENANCY_OCID:",
  process.env.OCI_TENANCY_OCID ? "SET" : "NOT SET",
);

console.log("");

// Check required files
console.log("2. File System Check:");

const requiredFiles = ["./oracle_key.pem", "./.env", "./package.json"];

requiredFiles.forEach((file) => {
  const fullPath = path.resolve(file);
  try {
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    console.log(`   ${file}: ${exists ? "✓ EXISTS" : "✗ MISSING"}`);

    if (exists) {
      console.log(`     Size: ${stats.size} bytes`);
      console.log(`     Permissions: ${stats.mode.toString(8)}`);
      console.log(
        `     Readable: ${
          stats.isFile() &&
          fs.accessSync(fullPath, fs.constants.R_OK) === undefined
            ? "YES"
            : "NO"
        }`,
      );
    }
  } catch (error) {
    console.log(`   ${file}: ✗ ERROR - ${error.message}`);
  }
});
console.log("");

// Check Node.js and npm versions
console.log("3. Runtime Environment:");
console.log("   Node.js version:", process.version);
console.log("   Process ID:", process.pid);
console.log("   Current working directory:", process.cwd());
console.log("   Environment:", process.env.NODE_ENV || "development");
console.log("");

// Check network connectivity
console.log("4. Network Check:");
console.log("   Hostname:", require("os").hostname());
console.log("   Platform:", process.platform);
console.log("   Architecture:", process.arch);

// Test DNS resolution
const dns = require("dns");
dns.lookup("google.com", (err, address, family) => {
  console.log(
    `   DNS Resolution (google.com): ${err ? "FAILED" : "SUCCESS"}${
      address ? ` -> ${address}` : ""
    }`,
  );

  // Final summary
  console.log("\n=== DIAGNOSTIC COMPLETE ===");
  console.log(
    "If any checks show 'MISSING' or 'FAILED', that's likely your issue.",
  );
  console.log("Pay special attention to:");
  console.log("- firebaseServiceAccount.json file existence and permissions");
  console.log("- Environment variables being set properly");
  console.log("- Network connectivity to external services");
});
