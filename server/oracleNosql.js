require("dotenv").config();
const nosqldb = require("oracle-nosqldb");

const client = new nosqldb.NoSQLClient({
  region: process.env.OCI_REGION,
  auth: {
    iam: {
      tenantId: process.env.OCI_TENANCY_OCID,
      userId: process.env.OCI_USER_OCID,
      fingerprint: process.env.OCI_FINGERPRINT,
      privateKeyFile: process.env.OCI_PRIVATE_KEY_PATH,
    },
  },
});

module.exports = client;
