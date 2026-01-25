import React, { useState, useEffect } from "react";

const Settings = ({ token, onToggle2FASetup }) => {
  const [setupAllowed, setSetupAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load current 2FA setup setting
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await fetch("/api/auth/2fa-status");
        const data = await response.json();
        setSetupAllowed(data.setupAllowed);
      } catch (err) {
        console.error("Error loading 2FA status:", err);
      }
    };

    load2FAStatus();
  }, []);

  const handleToggle2FASetup = async () => {
    const newState = !setupAllowed;
    const confirmMessage = newState
      ? "Enable 2FA setup on login page?"
      : "Disable 2FA setup? Users won't be able to setup new 2FA, but existing users can still login.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/toggle-2fa-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: newState }),
      });

      const data = await response.json();

      if (response.ok) {
        setSetupAllowed(newState);
        setMessage(data.message);
        setMessageType("success");
        if (onToggle2FASetup) {
          onToggle2FASetup(newState);
        }
      } else {
        setMessage(data.error || "Failed to toggle 2FA setup");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Network error occurred");
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-6">
        {/* 2FA Setup Control Section */}
        <div className="border-l-4 border-blue-500 pl-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            2FA Setup Control
          </h3>
          <p className="text-gray-600 mb-4">
            Status:{" "}
            <span
              className={`font-bold ${
                setupAllowed ? "text-green-600" : "text-red-600"
              }`}
            >
              {setupAllowed ? "Enabled - Users can setup 2FA" : "Disabled - Setup button hidden from login"}
            </span>
          </p>

          <p className="text-gray-600 text-sm mb-4">
            {setupAllowed
              ? "The 'Setup 2FA' button is visible on the login page. Users can setup Google Authenticator."
              : "The 'Setup 2FA' button is hidden from the login page. Only code input is shown. Existing users can still login."}
          </p>

          <button
            onClick={handleToggle2FASetup}
            disabled={loading}
            className={`py-2 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              setupAllowed
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
            }`}
          >
            {loading
              ? "Updating..."
              : setupAllowed
                ? "Disable 2FA Setup"
                : "Enable 2FA Setup"}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">
            How This Works
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>
                <strong>Setup Enabled:</strong> New users can setup 2FA from login page
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>
                <strong>Setup Disabled:</strong> "Setup 2FA" button is hidden, only code input shown
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>
                <strong>Existing Users:</strong> Can always login with their existing 2FA codes
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>
                <strong>Re-enable:</strong> You can re-enable setup at any time from this page
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
