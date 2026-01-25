import React, { useState, useEffect } from "react";

const Login = ({ onLogin }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // 'login' or 'setup'
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupAllowed, setSetupAllowed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if 2FA setup is allowed on component mount
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await fetch("/api/auth/2fa-status");
        const data = await response.json();
        setSetupAllowed(data.setupAllowed);
      } catch (err) {
        console.error("Error checking 2FA status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    check2FAStatus();
  }, []);

  // Handle 2FA login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code.replace(/\s/g, "") }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error occurred");
    }

    setLoading(false);
  };

  // Setup 2FA
  const handleSetup2FA = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/setup-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
      } else {
        setError(data.error || "Failed to setup 2FA");
      }
    } catch (err) {
      setError("Network error occurred");
    }

    setSetupLoading(false);
  };

  // Verify 2FA setup
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: setupCode.replace(/\s/g, ""),
          secret: secret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("login");
        setSetupCode("");
        setSecret("");
        setQrCode("");
        setError("2FA setup added successfully! Now you can login with your 6-digit code.");
        setTimeout(() => setError(""), 3000);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Network error occurred");
    }

    setLoading(false);
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (step === "setup" && qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h4 className="text-2xl italic font-bold text-center text-gray-800 mb-4">
            DAILY BUGLE
          </h4>
          <h3 className="text-lg font-semibold text-center text-gray-700 mb-6">
            Setup 2FA Authentication
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with Google Authenticator app:
              </p>
              <div className="flex justify-center mb-4">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Or enter this code manually:
              </p>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm text-center break-all text-gray-800">
                {secret}
              </div>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label
                  htmlFor="setupCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter 6-digit code from Google Authenticator
                </label>
                <input
                  type="text"
                  id="setupCode"
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength="6"
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                />
              </div>
              {error && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    error.includes("successful")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={setupLoading || setupCode.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupLoading ? "Verifying..." : "Verify & Setup 2FA"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setQrCode("");
                  setSecret("");
                  setSetupCode("");
                }}
                className="w-full py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md focus:outline-none transition-all"
              >
                Back
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h4 className="text-2xl italic font-bold text-center text-gray-800 mb-8">
          DAILY BUGLE
        </h4>
        <form
          onSubmit={step === "login" ? handleLogin : handleSetup2FA}
          className="space-y-6"
        >
          {step === "login" ? (
            <>
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter 6-digit code from Google Authenticator
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength="6"
                  placeholder="000000"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
              {setupAllowed && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("setup");
                    handleSetup2FA({ preventDefault: () => {} });
                  }}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-all text-sm"
                >
                  Setup 2FA (First Time)
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm">
                Setting up 2-factor authentication...
              </p>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={setupLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupLoading ? "Loading..." : "Generate QR Code"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
